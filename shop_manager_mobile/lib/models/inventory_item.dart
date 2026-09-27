class InventoryItem {
  final int? id;
  final String sku;
  final String name;
  final String category;
  final double costPrice;
  final double sellingPrice;
  final double stockQuantity;
  final double minStockAlert;
  final String unit;
  final DateTime updatedAt;

  const InventoryItem({
    this.id,
    required this.sku,
    required this.name,
    required this.category,
    required this.costPrice,
    required this.sellingPrice,
    required this.stockQuantity,
    this.minStockAlert = 5.0,
    this.unit = 'pcs',
    required this.updatedAt,
  });

  bool get isLowStock => stockQuantity <= minStockAlert && stockQuantity > 0;
  bool get isOutOfStock => stockQuantity <= 0;
}

class Loan {
  final int? id;
  final String borrowerName;
  final String? borrowerPhone;
  final double principalAmount;
  final double balanceDue;
  final DateTime issueDate;
  final DateTime? dueDate;
  final String status;

  const Loan({
    this.id,
    required this.borrowerName,
    this.borrowerPhone,
    required this.principalAmount,
    required this.balanceDue,
    required this.issueDate,
    this.dueDate,
    this.status = 'ACTIVE',
  });
}

class Expense {
  final int? id;
  final String category;
  final double amount;
  final String? notes;
  final DateTime expenseDate;

  const Expense({
    this.id,
    required this.category,
    required this.amount,
    this.notes,
    required this.expenseDate,
  });
}
