import 'package:flutter/material.dart';
import '../utils/colors.dart';
import '../utils/typography.dart';

/// Reusable AnimatedIconTab widget for the bottom navigation bar.
///
/// Features:
/// - Smooth spring scale animation: scales up to ~1.15x then settles back to 1.0x (250ms, Curves.easeOutBack)
/// - Outlined icon at rest -> switches to Filled/Solid icon variant when active
/// - Inter typography label in sentence case
class AnimatedIconTab extends StatefulWidget {
  final IconData outlineIcon;
  final IconData filledIcon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const AnimatedIconTab({
    super.key,
    required this.outlineIcon,
    required this.filledIcon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  State<AnimatedIconTab> createState() => _AnimatedIconTabState();
}

class _AnimatedIconTabState extends State<AnimatedIconTab>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );

    // Spring-like bounce: scale up to 1.15 then settle to 1.0 using easeOutBack
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 1.15)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 45.0,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.15, end: 1.0)
            .chain(CurveTween(curve: Curves.easeOutBack)),
        weight: 55.0,
      ),
    ]).animate(_controller);

    if (widget.isSelected) {
      _controller.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(covariant AnimatedIconTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!oldWidget.isSelected && widget.isSelected) {
      _controller.forward(from: 0.0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final activeColor = AppColors.primary;
    final inactiveColor = AppColors.textSecondary;

    return Expanded(
      child: InkWell(
        onTap: widget.onTap,
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ScaleTransition(
                scale: _scaleAnimation,
                child: Icon(
                  widget.isSelected ? widget.filledIcon : widget.outlineIcon,
                  size: 24.0,
                  color: widget.isSelected ? activeColor : inactiveColor,
                ),
              ),
              const SizedBox(height: 4.0),
              Text(
                widget.label,
                style: AppTypography.labelSmall.copyWith(
                  fontWeight:
                      widget.isSelected ? FontWeight.w600 : FontWeight.w500,
                  color: widget.isSelected ? activeColor : inactiveColor,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
