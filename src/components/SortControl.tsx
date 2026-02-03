import React from "react";
import styled from "styled-components";
import type { SortOrder } from "../pages/useHome";

type Props = {
  sortOrder: SortOrder;
  onChange: (order: SortOrder) => void;
};

const SortControl = ({ sortOrder, onChange }: Props) => {
  return (
    <Wrap>
      <Label htmlFor="sort">Sort by creation</Label>
      <Select
        id="sort"
        value={sortOrder}
        onChange={(e) => onChange(e.target.value as SortOrder)}
      >
        <option value="created_desc">Newest first</option>
        <option value="created_asc">Oldest first</option>
      </Select>
    </Wrap>
  );
};

export default SortControl;

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Select = styled.select`
  height: 40px;
  border-radius: 12px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.panel};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.panelHover};
  }
`;