import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../utils/colors.dart';
import '../widgets/animated_icon_tab.dart';
import 'dashboard_screen.dart';
import 'billing_screen.dart';
import 'inventory_screen.dart';
import 'loans_screen.dart';
import 'more_screen.dart';

/// Main Shell Screen providing the bottom tab bar and animated icon switching
class MainShellScreen extends StatefulWidget {
  const MainShellScreen({super.key});

  @override
  State<MainShellScreen> createState() => _MainShellScreenState();
}

class _MainShellScreenState extends State<MainShellScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    BillingScreen(),
    InventoryScreen(),
    LoansScreen(),
    MoreScreen(),
  ];

  void _onTabTapped(int index) {
    if (_currentIndex == index) return;
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.surface,
          border: Border(
            top: BorderSide(color: AppColors.border, width: 1.0),
          ),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 60.0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                AnimatedIconTab(
                  outlineIcon: CupertinoIcons.square_grid_2x2,
                  filledIcon: CupertinoIcons.square_grid_2x2_fill,
                  label: 'Dashboard',
                  isSelected: _currentIndex == 0,
                  onTap: () => _onTabTapped(0),
                ),
                AnimatedIconTab(
                  outlineIcon: CupertinoIcons.doc_text,
                  filledIcon: CupertinoIcons.doc_text_fill,
                  label: 'Billing',
                  isSelected: _currentIndex == 1,
                  onTap: () => _onTabTapped(1),
                ),
                AnimatedIconTab(
                  outlineIcon: CupertinoIcons.cube_box,
                  filledIcon: CupertinoIcons.cube_box_fill,
                  label: 'Inventory',
                  isSelected: _currentIndex == 2,
                  onTap: () => _onTabTapped(2),
                ),
                AnimatedIconTab(
                  outlineIcon: CupertinoIcons.money_dollar_circle,
                  filledIcon: CupertinoIcons.money_dollar_circle_fill,
                  label: 'Loans',
                  isSelected: _currentIndex == 3,
                  onTap: () => _onTabTapped(3),
                ),
                AnimatedIconTab(
                  outlineIcon: CupertinoIcons.ellipsis_circle,
                  filledIcon: CupertinoIcons.ellipsis_circle_fill,
                  label: 'More',
                  isSelected: _currentIndex == 4,
                  onTap: () => _onTabTapped(4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
