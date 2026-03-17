from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Cart, CartItem
from posorders.models import POSOrder, POSOrderItem
from customers.models import Customer
from products.models import Product
from .serializers import CartSerializer, CartItemSerializer, EcommerceOrderSerializer
from posorders.serializers import POSOrderListSerializer
from utils.inventory_service import InventoryService

class EcommerceCartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            # Sync entire cart from local storage
            items = request.data.get('items', [])
            for item in items:
                p_id = item.get('id') or item.get('product')
                if p_id:
                    product = get_object_or_404(Product, id=p_id)
                    CartItem.objects.update_or_create(
                        cart=cart, product=product,
                        defaults={'quantity': item['quantity']}
                    )
            return Response(CartSerializer(cart, context={'request': request}).data)

        product = get_object_or_404(Product, id=product_id)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()

        return Response(CartSerializer(cart, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        product_id = request.data.get('product_id')
        if product_id:
            CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        else:
            cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CreateEcommerceOrderView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        cart, created = Cart.objects.get_or_create(user=user)
        if not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Get or Create Customer profile for the logged-in user
        customer, created = Customer.objects.get_or_create(
            user=user,
            defaults={
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'phone': user.mobile_number,
                'address': request.data.get('address', '')
            }
        )

        # 2. Create the Order
        # Use the owner of the first product as the 'user' (seller) for the POSOrder
        first_item = cart.items.first()
        seller = first_item.product.user

        order = POSOrder.objects.create(
            user=seller,
            customer=customer,
            order_status='pending',
            payment_status='pending',
            payment_method=request.data.get('payment_method', 'cod'),
            address=request.data.get('address', customer.address),
            city=request.data.get('city', ''),
            zipcode=request.data.get('zipcode', ''),
            notes=request.data.get('notes', ''),
        )

        # Prepare inventory items for processing
        inventory_items = []
        for item in cart.items.all():
            inventory_items.append({
                'product': item.product,
                'quantity': item.quantity
            })

        # Process inventory reduction (Bypassed)
        # success, messages, original_batches = InventoryService.process_order_inventory(inventory_items, user=seller)
        # if not success:
        #     return Response({
        #         "error": "Failed to process inventory",
        #         "details": messages
        #     }, status=status.HTTP_400_BAD_REQUEST)
        
        original_batches = {}

        subtotal = 0
        for item in cart.items.all():
            unit_price = item.product.price
            total_price = unit_price * item.quantity
            subtotal += total_price
            
            POSOrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                unit_price=unit_price,
                total_price=total_price,
                original_stock_batch=None
            )

        order.subtotal = subtotal
        order.total_amount = subtotal
        order.save()

        # 3. Clear Cart
        cart.items.all().delete()

        serializer = EcommerceOrderSerializer(order, context={'request': request})
        return Response({
            "message": "Order successful", 
            "order": serializer.data
        }, status=status.HTTP_201_CREATED)

class MyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch orders where the current user is the customer
        orders = POSOrder.objects.filter(customer__user=request.user).order_by('-created_at')
        serializer = EcommerceOrderSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)
