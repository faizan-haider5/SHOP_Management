import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../utils/colors.dart';
import '../utils/typography.dart';
import '../widgets/squircle_container.dart';
import '../widgets/section_tile.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'Al-Madina General Store',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
            Text(
              'Admin Configured · Offline POS',
              style: TextStyle(
                color: Colors.white70,
                fontWeight: FontWeight.w400,
                fontSize: 11,
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.wifi_off, size: 14, color: Colors.white70),
                SizedBox(width: 4),
                Text(
                  'Offline',
                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Offline banner
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                SquircleContainer(
                  size: 32,
                  cornerRadius: 8,
                  backgroundColor: AppColors.sectionBilling,
                  child: const Icon(Icons.storage_rounded, size: 18, color: AppColors.primary),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Local SQLite Database', style: AppTypography.labelMedium),
                      Text('Drift engine · Zero network calls', style: AppTypography.bodySecondary),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Daily Sales Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Today's Counter Sales", style: AppTypography.labelSmall),
                const SizedBox(height: 6),
                const Text('Rs 14,250', style: AppTypography.tabularTotal),
                const SizedBox(height: 4),
                Text('18 completed bills · Pakistani Rupees (PKR)', style: AppTypography.bodySecondary.copyWith(fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Quick Action Buttons
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accent,
                    foregroundColor: AppColors.textPrimary,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('New Bill', style: TextStyle(fontWeight: FontWeight.w600)),
                  onPressed: () {},
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.border),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.inventory_2_outlined, size: 18),
                  label: const Text('Add Item', style: TextStyle(fontWeight: FontWeight.w600)),
                  onPressed: () {},
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Overview Section Tiles
          const Text('Shop Modules', style: AppTypography.heading3),
          const SizedBox(height: 8),
          SectionTile(
            title: 'Billing Counter',
            subtitle: 'Offline POS, barcode scan & thermal receipt',
            icon: CupertinoIcons.doc_text,
            iconTintColor: AppColors.sectionBilling,
            iconColor: AppColors.primary,
            onTap: () {},
          ),
          SectionTile(
            title: 'Inventory & Stock',
            subtitle: '142 products · 3 low stock alerts',
            icon: CupertinoIcons.cube_box,
            iconTintColor: AppColors.sectionInventory,
            iconColor: AppColors.warning,
            onTap: () {},
          ),
          SectionTile(
            title: 'Customer Loans Ledger',
            subtitle: 'Rs 3,400 outstanding balance',
            icon: CupertinoIcons.creditcard,
            iconTintColor: AppColors.sectionLoans,
            iconColor: Colors.indigo,
            onTap: () {},
          ),
        ],
      ),
    );
  }
}
