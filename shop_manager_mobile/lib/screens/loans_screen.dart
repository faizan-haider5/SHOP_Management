import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../utils/colors.dart';
import '../utils/typography.dart';

class LoansScreen extends StatelessWidget {
  const LoansScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        title: const Text(
          'Customer Loans Ledger',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_outlined, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Total Due Summary Card
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Total Outstanding Loans', style: AppTypography.labelSmall),
                    SizedBox(height: 4),
                    Text('Rs 3,500', style: AppTypography.tabularTotal),
                  ],
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accent,
                    foregroundColor: AppColors.textPrimary,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () {},
                  child: const Text('New Loan', style: TextStyle(fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),

          // Loans List
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildLoanCard('Ahmad Raza (Raza Karyana)', '0300-1234567', 'Rs 2,400', 'Due in 3 days', AppColors.warning),
                _buildLoanCard('Kamran Ali (Ali Corner)', '0321-9876543', 'Rs 1,100', 'Overdue 2 days', AppColors.danger),
                _buildLoanCard('Haji Aslam (Madina General)', '0333-4567890', 'Rs 500 (Advance)', 'Credit Advance', AppColors.success),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoanCard(String name, String phone, String amount, String dueText, Color statusColor) {
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
              Text(name, style: AppTypography.labelMedium.copyWith(fontSize: 15)),
              const SizedBox(height: 2),
              Text(phone, style: AppTypography.bodySecondary.copyWith(fontSize: 12)),
              const SizedBox(height: 4),
              Text(dueText, style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w500)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(amount, style: AppTypography.tabularCurrency.copyWith(fontSize: 18, color: AppColors.danger)),
              const SizedBox(height: 4),
              const Text('Balance Due', style: AppTypography.labelSmall),
            ],
          ),
        ],
      ),
    );
  }
}
