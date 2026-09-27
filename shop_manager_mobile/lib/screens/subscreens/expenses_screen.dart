import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../utils/colors.dart';
import '../../utils/typography.dart';
import '../../widgets/squircle_container.dart';

class ExpensesSubscreen extends StatelessWidget {
  const ExpensesSubscreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        title: const Text('Expenses', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
        leading: IconButton(
          icon: const Icon(CupertinoIcons.back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('This Month Total (PKR)', style: AppTypography.labelSmall),
                    SizedBox(height: 4),
                    Text('Rs 4,550', style: AppTypography.tabularTotal),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text('Recent Expenses', style: AppTypography.heading3),
          const SizedBox(height: 8),
          _buildItem('Petrol for Delivery Bike', 'Today · Transportation', 'Rs 1,500'),
          _buildItem('Counter Lunch & Tea', 'Yesterday · Refreshment', 'Rs 850'),
          _buildItem('Bike Brake & Oil Service', '3 days ago · Maintenance', 'Rs 2,200'),
        ],
      ),
    );
  }

  Widget _buildItem(String title, String sub, String amt) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: AppTypography.labelMedium),
              const SizedBox(height: 2),
              Text(sub, style: AppTypography.bodySecondary.copyWith(fontSize: 11)),
            ],
          ),
          Text(amt, style: AppTypography.tabularCurrency),
        ],
      ),
    );
  }
}

class PartnershipSubscreen extends StatelessWidget {
  const PartnershipSubscreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        title: const Text('Partnership Accounts', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
        leading: IconButton(
          icon: const Icon(CupertinoIcons.back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildPartnerCard('Sadaf Ali (Managing Partner)', '60% share', 'Rs 480,000 capital'),
          _buildPartnerCard('Bilal Ahmed (Silent Partner)', '40% share', 'Rs 320,000 capital'),
        ],
      ),
    );
  }

  Widget _buildPartnerCard(String name, String share, String capital) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          SquircleContainer(
            size: 40,
            cornerRadius: 11,
            backgroundColor: AppColors.sectionPartnership,
            child: const Icon(CupertinoIcons.person_solid, size: 20, color: Colors.deepPurple),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: AppTypography.labelMedium.copyWith(fontSize: 15)),
                Text('$share · $capital', style: AppTypography.bodySecondary.copyWith(fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ReportsSubscreen extends StatelessWidget {
  const ReportsSubscreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        title: const Text('Reports & Analytics', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
        leading: IconButton(
          icon: const Icon(CupertinoIcons.back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildReportTile('Daily Sales Register', 'Total invoices, net receipts & discounts', CupertinoIcons.doc_plaintext),
          _buildReportTile('Inventory Stock Valuation', 'Current cost vs. estimated retail value', CupertinoIcons.cube_box),
          _buildReportTile('Loan Aging Report', 'Outstanding customer balances & overdue notices', CupertinoIcons.clock),
          _buildReportTile('Profit & Loss Summary', 'Gross profit margins and monthly overheads', CupertinoIcons.graph_circle),
        ],
      ),
    );
  }

  Widget _buildReportTile(String title, String subtitle, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        leading: SquircleContainer(
          size: 38,
          cornerRadius: 10,
          backgroundColor: AppColors.sectionReports,
          child: Icon(icon, size: 20, color: AppColors.success),
        ),
        title: Text(title, style: AppTypography.labelMedium),
        subtitle: Text(subtitle, style: AppTypography.bodySecondary.copyWith(fontSize: 12)),
        trailing: const Icon(Icons.chevron_right, size: 18, color: AppColors.textSecondary),
        onTap: () {},
      ),
    );
  }
}

class SettingsSubscreen extends StatelessWidget {
  const SettingsSubscreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        title: const Text('Settings', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
        leading: IconButton(
          icon: const Icon(CupertinoIcons.back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSettingTile('Shop Profile', 'Shop Name, Currency & Tax Registration', CupertinoIcons.building_2_fill),
          _buildSettingTile('Thermal Receipt Printer', 'Bluetooth ESC/POS 58mm/80mm setup', CupertinoIcons.printer),
          _buildSettingTile('Backup & Export', 'Export SQLite database backup file', CupertinoIcons.arrow_down_doc),
          _buildSettingTile('Database Integrity Check', 'Verify Drift SQLite local tables', CupertinoIcons.check_mark_circled),
        ],
      ),
    );
  }

  Widget _buildSettingTile(String title, String subtitle, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        leading: SquircleContainer(
          size: 38,
          cornerRadius: 10,
          backgroundColor: AppColors.sectionSettings,
          child: Icon(icon, size: 20, color: AppColors.textPrimary),
        ),
        title: Text(title, style: AppTypography.labelMedium),
        subtitle: Text(subtitle, style: AppTypography.bodySecondary.copyWith(fontSize: 12)),
        trailing: const Icon(Icons.chevron_right, size: 18, color: AppColors.textSecondary),
        onTap: () {},
      ),
    );
  }
}
