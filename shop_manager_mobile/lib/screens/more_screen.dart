import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../utils/colors.dart';
import '../utils/typography.dart';
import '../widgets/section_tile.dart';
import 'subscreens/expenses_screen.dart';
import 'subscreens/partnership_screen.dart';
import 'subscreens/reports_screen.dart';
import 'subscreens/settings_screen.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  void _navigateTo(BuildContext context, Widget screen) {
    // Subtle iOS-style slide/fade transition
    Navigator.of(context).push(
      CupertinoPageRoute(builder: (context) => screen),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        title: const Text(
          'More Modules',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 18),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Shop Operations', style: AppTypography.heading3),
          const SizedBox(height: 8),

          SectionTile(
            title: 'Expenses',
            subtitle: 'Rent, electricity, supplies & maintenance',
            icon: CupertinoIcons.chart_pie,
            iconTintColor: AppColors.sectionExpenses,
            iconColor: AppColors.danger,
            onTap: () => _navigateTo(context, const ExpensesSubscreen()),
          ),
          SectionTile(
            title: 'Partnership',
            subtitle: 'Profit sharing & capital contribution accounts',
            icon: CupertinoIcons.person_2,
            iconTintColor: AppColors.sectionPartnership,
            iconColor: Colors.deepPurple,
            onTap: () => _navigateTo(context, const PartnershipSubscreen()),
          ),
          SectionTile(
            title: 'Reports & Analytics',
            subtitle: 'Daily register, profit margins & tax summary',
            icon: CupertinoIcons.chart_bar,
            iconTintColor: AppColors.sectionReports,
            iconColor: AppColors.success,
            onTap: () => _navigateTo(context, const ReportsSubscreen()),
          ),

          const SizedBox(height: 16),
          const Text('Preferences & System', style: AppTypography.heading3),
          const SizedBox(height: 8),

          SectionTile(
            title: 'Settings',
            subtitle: 'Shop details, thermal printer, backup & database',
            icon: CupertinoIcons.gear_alt,
            iconTintColor: AppColors.sectionSettings,
            iconColor: AppColors.textPrimary,
            onTap: () => _navigateTo(context, const SettingsSubscreen()),
          ),

          const SizedBox(height: 24),
          Center(
            child: Text(
              'Shop Manager Mobile v1.0.0 · 100% Offline SQLite',
              style: AppTypography.bodySecondary.copyWith(fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }
}
