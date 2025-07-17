import React from "react";
import { OperationButton } from "./OperationButton";
import type { CalculatorOperation } from "../../../types";

interface OperationBarProps {
  operations: Array<{ symbol: string; label: string; color: string }>;
  currentOperation: CalculatorOperation;
  onOperationClick: (symbol: CalculatorOperation) => void;
}

export const OperationBar: React.FC<OperationBarProps> = ({
  operations,
  currentOperation,
  onOperationClick,
}) => (
  <div className="flex gap-2 mb-[19px] mt-[14px]">
    {operations.map((op) => (
      <OperationButton
        key={op.symbol}
        symbol={op.symbol}
        label={op.label}
        color={op.color}
        isActive={currentOperation === op.symbol}
        onClick={() => onOperationClick(op.symbol as CalculatorOperation)}
      />
    ))}
  </div>
); 