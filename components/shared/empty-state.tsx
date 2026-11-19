"use client";

import React from "react";

import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export interface EmptyStateCard {
  title: string;
  description: string;
  // SVG name under /public/icons/, e.g. "items" -> /icons/items.svg
  icon: string;
  buttonLabel: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}

interface EmptyStateCardsProps {
  cards: EmptyStateCard[];
  className?: string;
}

// Generic version of Zoho's empty-module state: a grid of option cards,
// each with an illustration, description, and CTA button.
const EmptyStateCards = ({ cards, className }: EmptyStateCardsProps) => {
  return (
    <div
      className={`grid grid-cols-2 items-center justify-center gap-5 p-4 ${className ?? ""}`}
    >
      {cards.map((card) => (
        <div
          key={card.title}
          className="flex flex-col items-center rounded-sm bg-white p-4 drop-shadow-lg dark:bg-card"
        >
          <h3 className="text-lg font-semibold">{card.title}</h3>
          <Icon name={card.icon} width={130} height={130} />
          <p className="text-center text-sm text-muted-foreground">
            {card.description}
          </p>
          <Button
            className="mt-3"
            size="sm"
            onClick={card.onAction}
            disabled={card.actionDisabled}
          >
            {card.buttonLabel}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default EmptyStateCards;
