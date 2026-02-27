from django.db import transaction
from django.core.exceptions import ValidationError
from inventory.models import StockBatch

class InventoryService:
    
    @staticmethod
    def check_stock_availability(product, required_quantity, user=None):
        """
        Check if required quantity is available in active batch
        Returns: (is_available: bool, available_quantity: int, active_batch: StockBatch or None)
        """
        try:
            if user:
                active_batch = StockBatch.objects.get(
                    product=product,
                    batch_status='active',
                    user=user  # ✅ Added user filter
                )
            else:
                # For backward compatibility
                active_batch = StockBatch.objects.filter(
                    product=product,
                    batch_status='active'
                ).first()
                if not active_batch:
                    return False, 0, None
            
            is_available = active_batch.quantity >= required_quantity
            return is_available, active_batch.quantity, active_batch
            
        except StockBatch.DoesNotExist:
            return False, 0, None
    
    @staticmethod
    def validate_order_items_stock(order_items_data, user=None):
        """
        Validate stock for multiple order items
        order_items_data: list of dicts [{'product': product_obj, 'quantity': int}, ...]
        Returns: (is_valid: bool, error_messages: list)
        """
        error_messages = []
        
        for item in order_items_data:
            product = item['product']
            required_qty = item['quantity']
            
            is_available, available_qty, _ = InventoryService.check_stock_availability(
                product, required_qty, user  # ✅ Pass user parameter
            )
            
            if not is_available:
                error_messages.append(
                    f"Insufficient stock for {product.product_name}. "
                    f"Required: {required_qty}, Available: {available_qty}"
                )
        
        return len(error_messages) == 0, error_messages
    
    @staticmethod
    @transaction.atomic
    def reduce_stock(product, quantity, user=None):
        """
        Reduce stock from active batch and handle batch transitions
        Returns: (success: bool, message: str, original_batch: StockBatch or None, new_active_batch: StockBatch or None)
        """
        try:
            if user:
                active_batch = StockBatch.objects.select_for_update().get(
                    product=product,
                    batch_status='active',
                    user=user  # ✅ Added user filter
                )
            else:
                # For backward compatibility
                active_batch = StockBatch.objects.select_for_update().filter(
                    product=product,
                    batch_status='active'
                ).first()
                if not active_batch:
                    return False, "No active batch found for this product", None, None
            
            if active_batch.quantity < quantity:
                return False, f"Insufficient stock. Available: {active_batch.quantity}, Required: {quantity}", None, None
            
            # IMPORTANT: Store reference to original batch BEFORE any changes
            original_batch = active_batch
            
            # Reduce quantity
            active_batch.quantity -= quantity
            
            # If batch is empty, mark as sold and activate next batch
            if active_batch.quantity == 0:
                new_active_batch = active_batch.mark_as_sold()
                return True, f"Stock reduced. Batch {active_batch.id} sold out. New active batch: {new_active_batch.id if new_active_batch else 'None'}", original_batch, new_active_batch
            else:
                active_batch.save()
                return True, f"Stock reduced. Remaining quantity: {active_batch.quantity}", original_batch, active_batch
                
        except StockBatch.DoesNotExist:
            return False, "No active batch found for this product", None, None
        except Exception as e:
            return False, f"Error reducing stock: {str(e)}", None, None
    
    @staticmethod
    @transaction.atomic
    def process_order_inventory(order_items_data, user=None):
        """
        Process inventory reduction for complete order
        order_items_data: list of dicts [{'product': product_obj, 'quantity': int}, ...]
        Returns: (success: bool, messages: list, original_batches: dict)
        """
        messages = []
        original_batches = {}  # {product_id: original_batch_obj}
        
        # First validate all items
        is_valid, error_messages = InventoryService.validate_order_items_stock(
            order_items_data, user  # ✅ Pass user parameter
        )
        if not is_valid:
            return False, error_messages, {}
        
        # Process each item
        for item in order_items_data:
            product = item['product']
            quantity = item['quantity']
            
            success, message, original_batch, _ = InventoryService.reduce_stock(
                product, quantity, user  # ✅ Pass user parameter
            )
            messages.append(f"{product.product_name}: {message}")
            
            if not success:
                # This shouldn't happen due to validation, but handle it
                raise ValidationError(f"Failed to reduce stock for {product.product_name}: {message}")
            
            # Store original batch for this product
            original_batches[product.id] = original_batch
        
        return True, messages, original_batches
    
    @staticmethod
    @transaction.atomic
    def rollback_stock(product, quantity, user=None):
        """
        Legacy rollback method for backward compatibility
        This will add quantity back to the current active batch
        """
        try:
            if user:
                active_batch = StockBatch.objects.get(
                    product=product,
                    batch_status='active',
                    user=user  # ✅ Added user filter
                )
            else:
                active_batch = StockBatch.objects.filter(
                    product=product,
                    batch_status='active'
                ).first()
                if not active_batch:
                    return False, "No active batch found to restore stock"
            
            active_batch.quantity += quantity
            active_batch.save()
            
            return True, f"Stock restored to active batch. Current quantity: {active_batch.quantity}"
            
        except StockBatch.DoesNotExist:
            return False, "No active batch found to restore stock"
        except Exception as e:
            return False, f"Error restoring stock: {str(e)}"
    
    @staticmethod
    @transaction.atomic
    def rollback_stock_to_original_batch(original_batch, quantity):
        """
        NEW METHOD: Restore stock to the original batch it came from
        This is the CORRECT way to handle order cancellations
        """
        try:
            # If original batch is 'sold', we need to reactivate it carefully
            if original_batch.batch_status == 'sold':
                # Check if there's currently an active batch for this product
                current_active = StockBatch.objects.filter(
                    product=original_batch.product,
                    batch_status='active',
                    user=original_batch.user  # ✅ Filter by same user as original batch
                ).first()
                
                # Restore quantity to original batch
                original_batch.quantity += quantity
                
                # If no current active batch, make original batch active again
                if not current_active:
                    original_batch.batch_status = 'active'
                else:
                    # If there is an active batch, original batch becomes 'not_active'
                    # This maintains the current active batch while restoring the stock
                    original_batch.batch_status = 'not_active'
                
                original_batch.save()
                return True, f"Stock restored to original batch {original_batch.id}. Status: {original_batch.batch_status}. Quantity: {original_batch.quantity}"
                
            else:
                # Original batch is still active/not_active, just add quantity
                original_batch.quantity += quantity
                original_batch.save()
                return True, f"Stock restored to batch {original_batch.id}. Quantity: {original_batch.quantity}"
                
        except Exception as e:
            return False, f"Error restoring stock to original batch: {str(e)}"
    
    @staticmethod
    def get_available_stock(product, user=None):
        """
        Get current available stock for a product
        Returns: (available_quantity: int, active_batch_id: int or None)
        """
        try:
            if user:
                active_batch = StockBatch.objects.get(
                    product=product,
                    batch_status='active',
                    user=user  # ✅ Added user filter
                )
            else:
                active_batch = StockBatch.objects.filter(
                    product=product,
                    batch_status='active'
                ).first()
                if not active_batch:
                    return 0, None
            
            return active_batch.quantity, active_batch.id
        except StockBatch.DoesNotExist:
            return 0, None
