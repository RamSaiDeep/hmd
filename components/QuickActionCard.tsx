import React from 'react';
import Link from 'next/link';

type QuickActionCardProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
};

export function QuickActionCard({
  href,
  icon,
  title,
  description,
  className = ''
}: QuickActionCardProps) {
  return (
    <Link href={href}>
      <div className={`glass glass-hover p-6 rounded-xl cursor-pointer h-full transition-all hover:scale-105 ${className}`}>
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}
