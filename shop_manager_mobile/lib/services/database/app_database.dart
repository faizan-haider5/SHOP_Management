import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

part 'app_database.g.dart';

/// Tables for Shop Manager Mobile — 100% Offline SQLite via Drift
class InventoryItemsTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get sku => text().withLength(min: 1, max: 32)();
  TextColumn get name => text().withLength(min: 1, max: 120)();
  TextColumn get category => text().withLength(min: 1, max: 60)();
  RealColumn get costPrice => real()();
  RealColumn get sellingPrice => real()();
  RealColumn get stockQuantity => real()();
  RealColumn get minStockAlert => real().withDefault(const Constant(5.0))();
  TextColumn get unit => text().withDefault(const Constant('pcs'))();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
}

class BillsTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get billNumber => text().unique()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  TextColumn get customerName => text().nullable()();
  TextColumn get customerPhone => text().nullable()();
  RealColumn get subtotal => real()();
  RealColumn get discount => real().withDefault(const Constant(0.0))();
  RealColumn get tax => real().withDefault(const Constant(0.0))();
  RealColumn get grandTotal => real()();
  TextColumn get paymentMode => text().withDefault(const Constant('CASH'))(); // CASH, ONLINE, CREDIT
  TextColumn get status => text().withDefault(const Constant('COMPLETED'))(); // DRAFT, COMPLETED, VOID
}

class BillLineItemsTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get billId => integer().references(BillsTable, #id)();
  IntColumn get itemId => integer().references(InventoryItemsTable, #id)();
  TextColumn get itemName => text()();
  RealColumn get quantity => real()();
  RealColumn get unitPrice => real()();
  RealColumn get lineTotal => real()();
}

class LoansTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get borrowerName => text().withLength(min: 1, max: 120)();
  TextColumn get borrowerPhone => text().nullable()();
  RealColumn get principalAmount => real()();
  RealColumn get balanceDue => real()();
  DateTimeColumn get issueDate => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get dueDate => dateTime().nullable()();
  TextColumn get status => text().withDefault(const Constant('ACTIVE'))(); // ACTIVE, OVERDUE, SETTLED
}

class ExpensesTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get category => text()();
  RealColumn get amount => real()();
  TextColumn get notes => text().nullable()();
  DateTimeColumn get expenseDate => dateTime().withDefault(currentDateAndTime)();
}

@DriftDatabase(tables: [
  InventoryItemsTable,
  BillsTable,
  BillLineItemsTable,
  LoansTable,
  ExpensesTable,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  static QueryExecutor _openConnection() {
    return driftDatabase(
      name: 'shop_manager_local',
      native: const DriftNativeOptions(
        shareAcrossIsolates: true,
      ),
    );
  }
}

/// Riverpod provider for the single-source-of-truth local database
final appDatabaseProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase();
  ref.onDispose(() => db.close());
  return db;
});
