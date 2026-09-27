import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

/// Offline PDF generation service for bills, counter receipts, and loan reports.
/// Completely local, no network dependencies.
class InvoicePdfService {
  InvoicePdfService._();

  static Future<Uint8List> generateInvoiceReceiptPdf({
    required String billNumber,
    required String shopName,
    required String dateStr,
    required String? customerName,
    required List<Map<String, dynamic>> items,
    required double subtotal,
    required double discount,
    required double grandTotal,
  }) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.roll80, // Standard 80mm thermal receipt format
        margin: const pw.EdgeInsets.all(12),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.center,
            children: [
              pw.Text(
                shopName,
                style: pw.TextStyle(
                  fontSize: 16,
                  fontWeight: pw.FontWeight.bold,
                ),
              ),
              pw.SizedBox(height: 4),
              pw.Text('Counter Receipt #$billNumber',
                  style: const pw.TextStyle(fontSize: 10)),
              pw.Text(dateStr, style: const pw.TextStyle(fontSize: 9)),
              if (customerName != null && customerName.isNotEmpty) ...[
                pw.SizedBox(height: 2),
                pw.Text('Customer: $customerName',
                    style: const pw.TextStyle(fontSize: 9)),
              ],
              pw.Divider(thickness: 0.8),
              pw.SizedBox(height: 4),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('Item',
                      style: pw.TextStyle(
                          fontSize: 9, fontWeight: pw.FontWeight.bold)),
                  pw.Text('Qty x Price',
                      style: pw.TextStyle(
                          fontSize: 9, fontWeight: pw.FontWeight.bold)),
                  pw.Text('Total',
                      style: pw.TextStyle(
                          fontSize: 9, fontWeight: pw.FontWeight.bold)),
                ],
              ),
              pw.SizedBox(height: 4),
              ...items.map((item) {
                final double itemTotal =
                    (item['quantity'] as num) * (item['unitPrice'] as num);
                return pw.Padding(
                  padding: const pw.EdgeInsets.symmetric(vertical: 2),
                  child: pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Expanded(
                        child: pw.Text(
                          item['name'].toString(),
                          style: const pw.TextStyle(fontSize: 9),
                          maxLines: 1,
                        ),
                      ),
                      pw.Text(
                        '${item['quantity']} @ ${item['unitPrice']}',
                        style: const pw.TextStyle(fontSize: 9),
                      ),
                      pw.SizedBox(width: 8),
                      pw.Text(
                        'Rs ${itemTotal.toStringAsFixed(0)}',
                        style: pw.TextStyle(
                            fontSize: 9, fontWeight: pw.FontWeight.bold),
                      ),
                    ],
                  ),
                );
              }),
              pw.Divider(thickness: 0.8),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('Grand Total (PKR):',
                      style: pw.TextStyle(
                          fontSize: 11, fontWeight: pw.FontWeight.bold)),
                  pw.Text(
                    'Rs ${grandTotal.toStringAsFixed(0)}',
                    style: pw.TextStyle(
                        fontSize: 12, fontWeight: pw.FontWeight.bold),
                  ),
                ],
              ),
              pw.SizedBox(height: 12),
              pw.Text('Thank you for your business!',
                  style: const pw.TextStyle(fontSize: 8)),
              pw.Text('* Offline Shop Manager *',
                  style: const pw.TextStyle(fontSize: 7)),
            ],
          );
        },
      ),
    );

    return pdf.save();
  }

  static Future<void> printReceiptDirectly(Uint8List pdfData) async {
    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdfData,
    );
  }
}
