import 'package:flutter/material.dart';

/// Design System Color Palette for Shop Manager Mobile
/// All screens and widgets must reference these tokens directly.
class AppColors {
  AppColors._();

  /// Primary (nav, headers, prominent bars)
  static const Color primary = Color(0xFF1B4B43); // Deep teal

  /// Accent (primary actions, e.g. "New Bill", "Save")
  static const Color accent = Color(0xFFE3A008); // Warm mustard

  /// Background of screens
  static const Color background = Color(0xFFF6F5F1); // Warm off-white

  /// Surface (cards/panels)
  static const Color surface = Color(0xFFFFFFFF); // White

  /// Text primary
  static const Color textPrimary = Color(0xFF22262B); // Charcoal

  /// Text secondary
  static const Color textSecondary = Color(0xFF6B7078); // Muted grey

  /// Success state
  static const Color success = Color(0xFF2E7D4F); // Forest green

  /// Warning (low stock, due soon)
  static const Color warning = Color(0xFFE3A008); // Mustard

  /// Danger (overdue, delete, out of stock)
  static const Color danger = Color(0xFFB3491F); // Muted rust

  /// Borders and subtle dividers (1px)
  static const Color border = Color(0xFFE3E0D8);

  // Section Accent Tints (for squircle icon backgrounds)
  static const Color sectionBilling = Color(0xFFE2EFEA);
  static const Color sectionInventory = Color(0xFFFEF4DC);
  static const Color sectionLoans = Color(0xFFECEFF8);
  static const Color sectionExpenses = Color(0xFFFDE8E1);
  static const Color sectionPartnership = Color(0xFFF0EBF8);
  static const Color sectionReports = Color(0xFFE5F4EB);
  static const Color sectionSettings = Color(0xFFEFEFEF);
}
