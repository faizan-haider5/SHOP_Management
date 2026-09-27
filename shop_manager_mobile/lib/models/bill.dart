class Bill {
  final int? id;
  final String billNumber;
  final DateTime createdAt;
  final String? customerName;
  final String? customerPhone;
  final double subtotal;
  final double discount;
  final double tax;
  final double grandTotal;
  final String paymentMode;
  final String status;

  const Bill({
    this.id,
    required this.billNumber,
    required this.createdAt,
    this.customerName,
    this.customerPhone,
    required this.subtotal,
    this.discount = 0.0,
    this.tax = 0.0,
    required this.grandTotal,
    this.paymentMode = 'CASH',
    this.status = 'COMPLETED',
  });
}

class BillItem {
  final int? id;
  final int billId;
  final int itemId;
  final String itemName;
  final double quantity;
  final double unitPrice;
  final double lineTotal;

  const BillItem({
    this.id,
    required this.billId,
    required this.itemId,
    required this.itemName,
    required this.quantity,
    required this.unitPrice,
    required this.lineTotal,
  });
}
