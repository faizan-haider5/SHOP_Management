import 'package:flutter/material.dart';
import '../utils/colors.dart';
import '../utils/typography.dart';
import 'squircle_container.dart';

/// Flat section tile with thin 1px border (#E3E0D8) and accent-tinted squircle icon
class SectionTile extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData icon;
  final Color iconTintColor;
  final Color iconColor;
  final Widget? trailing;
  final VoidCallback? onTap;

  const SectionTile({
    super.key,
    required this.title,
    this.subtitle,
    required this.icon,
    required this.iconTintColor,
    this.iconColor = AppColors.primary,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: AppColors.border, width: 1.0),
      ),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 4.0),
        leading: SquircleContainer(
          size: 40.0,
          cornerRadius: 11.0,
          backgroundColor: iconTintColor,
          child: Icon(icon, color: iconColor, size: 22.0),
        ),
        title: Text(
          title,
          style: AppTypography.labelMedium.copyWith(fontSize: 15.0),
        ),
        subtitle: subtitle != null
            ? Text(
                subtitle!,
                style: AppTypography.bodySecondary.copyWith(fontSize: 12.0),
              )
            : null,
        trailing: trailing ??
            const Icon(
              Icons.chevron_right,
              color: AppColors.textSecondary,
              size: 20.0,
            ),
      ),
    );
  }
}
