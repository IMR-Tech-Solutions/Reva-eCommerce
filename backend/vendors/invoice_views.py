from django.template.loader import render_to_string
from weasyprint import HTML
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from accounts.premissions import HasModuleAccess, IsOwnerOrAdmin
from vendors.models import VendorInvoice
from inventory.models import StockBatch
from django.conf import settings
from django.utils.dateparse import parse_date

def format_date(date_str):
    if not date_str:
        return ''
    if hasattr(date_str, 'strftime'):
        return date_str.strftime("%d %B %Y")
    dt = parse_date(str(date_str))
    return dt.strftime("%d %B %Y") if dt else ''

class VendorInvoicePDFBaseView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess, IsOwnerOrAdmin]
    required_permission = "view-vendor-invoices"

    def generate_pdf(self, request, invoice_id):
        invoice = get_object_or_404(VendorInvoice, pk=invoice_id)
        self.check_object_permissions(request, invoice) 
        
        vendor = invoice.vendor

        # Get stock batches linked to this invoice
        batches = StockBatch.objects.filter(
            vendor_invoice=invoice
        ).select_related('product').order_by('created_at')

        if not batches.exists():
            return None, None

        total_amount = 0
        total_tax = 0
        items = []

        for batch in batches:
            product = batch.product
            item_total = float(batch.original_quantity) * float(batch.purchase_price)
            batch_tax = float(batch.tax_amount or 0)
            total_amount += item_total
            total_tax += batch_tax

            items.append({
                "product_name": product.product_name,
                "quantity": batch.original_quantity,
                "unit": product.unit or "Piece",
                "purchase_price": float(batch.purchase_price),
                "total_price": item_total,
                "tax_amount": batch_tax,
                "reference_number": batch.reference_number or 'N/A',
                "mfg_date": format_date(batch.manufacture_date),
                "exp_date": format_date(batch.expiry_date),
            })

        context = {
            "invoice_number": invoice.invoice_number,
            "date": format_date(invoice.created_at.date()),
            "year": invoice.created_at.year,
            "vendor_name": vendor.vendor_name,
            "vendor_contact": vendor.contact_number or 'N/A',
            "vendor_email": vendor.email or 'N/A',
            "vendor_address": vendor.address or 'N/A',
            "vendor_gst": vendor.gst_number or 'N/A',
            "items": items,
            "total": total_amount,
            "total_tax": total_tax,
            "grand_total": total_amount + total_tax,
            "user_name": f"{request.user.first_name} {request.user.last_name}".strip(),
        }

        html_string = render_to_string("vendor_invoice.html", context)
        html = HTML(string=html_string, base_url=request.build_absolute_uri('/'))
        pdf_result = html.write_pdf()

        return pdf_result, invoice.invoice_number

class VendorInvoicePDFView(VendorInvoicePDFBaseView):
    """View PDF in browser"""
    def get(self, request, invoice_id):
        pdf_result, invoice_number = self.generate_pdf(request, invoice_id)
        if not pdf_result:
            return HttpResponse("No stock entries found for this invoice.", status=404)

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename=invoice_{invoice_number}.pdf'
        response.write(pdf_result)
        return response

class VendorInvoicePDFDownloadView(VendorInvoicePDFBaseView):
    """Download PDF file"""
    def get(self, request, invoice_id):
        pdf_result, invoice_number = self.generate_pdf(request, invoice_id)
        if not pdf_result:
            return HttpResponse("No stock entries found for this invoice.", status=404)

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename=invoice_{invoice_number}.pdf'
        response.write(pdf_result)
        return response

class VendorInvoiceListView(APIView):
    """List all user's vendor invoices"""
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "view-vendor-invoices"
    
    def get(self, request):
        from rest_framework.pagination import PageNumberPagination
        from vendors.serializers import VendorInvoiceSerializer
        
        invoices = VendorInvoice.objects.filter(
            user=request.user
        ).select_related("vendor").order_by("created_at")

        paginator = PageNumberPagination()
        paginated_invoices = paginator.paginate_queryset(invoices, request)
        serializer = VendorInvoiceSerializer(paginated_invoices, many=True)
        return paginator.get_paginated_response(serializer.data)
