import React, { useMemo } from "react";
import styled, { keyframes } from "styled-components";

import { buildPageItems } from "../utils/paginationUtils";

type Props = {
  page: number;
  totalPages: number | null;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (page: number) => void;
  loading: boolean;
};

const PaginationControls = ({
  page,
  totalPages,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onGoTo,
  loading,
}: Props) => {
  const items = useMemo(() => {
    if (!totalPages) return [];
    return buildPageItems(page, totalPages);
  }, [page, totalPages]);

  return (
    <Wrap>
      <Row>
        <NavButton
          onClick={onPrev}
          disabled={!canGoPrev}
          aria-label="Previous page"
        >
          Prev
        </NavButton>

        <Pages>
          {totalPages ? (
            items.map((it) => {
              if (it.type === "ellipsis") {
                return (
                  <Ellipsis key={it.key} aria-hidden="true">
                    …
                  </Ellipsis>
                );
              }
              return (
                <PageButton
                  key={it.value}
                  onClick={() => onGoTo(it.value)}
                  $active={it.active}
                  aria-current={it.active ? "page" : undefined}
                >
                  {it.value}
                </PageButton>
              );
            })
          ) : (
            <PageInfo>
              Page <strong>{page}</strong>
            </PageInfo>
          )}
        </Pages>

        <NavButton onClick={onNext} disabled={!canGoNext} aria-label="Next page">
          Next
        </NavButton>
      </Row>

      {loading ? (
        <LoadingPill aria-live="polite">
          <SmallSpinner />
          Loading…
        </LoadingPill>
      ) : null}
    </Wrap>
  );
};

export default PaginationControls;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 0 6px;
  flex-wrap: wrap;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Pages = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const PageInfo = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 650;
  }
`;

const NavButton = styled.button`
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.panel};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  transition:
    transform 120ms ease,
    border-color 120ms ease,
    background-color 120ms ease;

  &:hover:enabled {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.colors.borderHover};
    background-color: ${({ theme }) => theme.colors.panelHover};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const PageButton = styled.button<{ $active: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.panelHover : theme.colors.panel)};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  transition:
    transform 120ms ease,
    border-color 120ms ease,
    background-color 120ms ease;

  &:hover:enabled {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.colors.borderHover};
    background-color: ${({ theme }) => theme.colors.panelHover};
  }
`;

const Ellipsis = styled.div`
  width: 30px;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
`;

const LoadingPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
`;

const SmallSpinner = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-top: 2px solid ${({ theme }) => theme.colors.accent};
  animation: ${spin} 0.8s linear infinite;
`;