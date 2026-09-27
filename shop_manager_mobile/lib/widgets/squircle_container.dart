import 'package:flutter/material.dart';
import '../utils/colors.dart';
import '../utils/squircle_border.dart';

/// Reusable squircle container with continuous superellipse corners (~60% smoothing)
/// Used for app icons, category icons, and action buttons.
class SquircleContainer extends StatelessWidget {
  final Widget child;
  final double size;
  final Color backgroundColor;
  final BorderSide borderSide;
  final double cornerRadius;
  final VoidCallback? onTap;

  const SquircleContainer({
    super.key,
    required this.child,
    this.size = 48.0,
    this.backgroundColor = AppColors.surface,
    this.borderSide = BorderSide.none,
    this.cornerRadius = 14.0,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final shape = SquircleBorder(
      cornerRadius: cornerRadius,
      cornerSmoothing: 0.6,
      side: borderSide,
    );

    Widget content = Material(
      color: backgroundColor,
      shape: shape,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        customBorder: shape,
        onTap: onTap,
        child: SizedBox(
          width: size,
          height: size,
          child: Center(child: child),
        ),
      ),
    );

    return content;
  }
}
