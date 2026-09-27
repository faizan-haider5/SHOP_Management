import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Implements continuous superellipse (squircle) curvature with ~60% corner smoothing.
/// Used for app icons, category icons, and action button containers.
class SquircleBorder extends ShapeBorder {
  final double cornerRadius;
  final double cornerSmoothing; // Default 0.6 (60%)
  final BorderSide side;

  const SquircleBorder({
    this.cornerRadius = 16.0,
    this.cornerSmoothing = 0.6,
    this.side = BorderSide.none,
  });

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.all(side.width);

  @override
  ShapeBorder scale(double t) {
    return SquircleBorder(
      cornerRadius: cornerRadius * t,
      cornerSmoothing: cornerSmoothing,
      side: side.scale(t),
    );
  }

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) {
    return _createSquirclePath(rect.deflate(side.width));
  }

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    return _createSquirclePath(rect);
  }

  Path _createSquirclePath(Rect rect) {
    final path = Path();
    final width = rect.width;
    final height = rect.height;
    final left = rect.left;
    final top = rect.top;
    final right = rect.right;
    final bottom = rect.bottom;

    final maxRadius = math.min(width, height) / 2;
    final r = math.min(cornerRadius, maxRadius);
    final p = (1 + cornerSmoothing) * r;

    path.moveTo(left + p, top);
    path.lineTo(right - p, top);
    path.cubicTo(
      right - (1 - cornerSmoothing) * r,
      top,
      right,
      top + (1 - cornerSmoothing) * r,
      right,
      top + p,
    );
    path.lineTo(right, bottom - p);
    path.cubicTo(
      right,
      bottom - (1 - cornerSmoothing) * r,
      right - (1 - cornerSmoothing) * r,
      bottom,
      right - p,
      bottom,
    );
    path.lineTo(left + p, bottom);
    path.cubicTo(
      left + (1 - cornerSmoothing) * r,
      bottom,
      left,
      bottom - (1 - cornerSmoothing) * r,
      left,
      bottom - p,
    );
    path.lineTo(left, top + p);
    path.cubicTo(
      left,
      top + (1 - cornerSmoothing) * r,
      left + (1 - cornerSmoothing) * r,
      top,
      left + p,
      top,
    );
    path.close();
    return path;
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    if (side.style == BorderStyle.none || side.width == 0.0) return;
    final paint = side.toPaint();
    canvas.drawPath(getOuterPath(rect), paint);
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    if (other.runtimeType != runtimeType) return false;
    return other is SquircleBorder &&
        other.cornerRadius == cornerRadius &&
        other.cornerSmoothing == cornerSmoothing &&
        other.side == side;
  }

  @override
  int get hashCode => Object.hash(cornerRadius, cornerSmoothing, side);
}
