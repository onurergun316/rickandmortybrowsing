import React, { useEffect } from "react";
import styled from "styled-components";
import type { Character } from "../models/Character";

type Props = {
  characters: Character[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

const CharacterModal = ({ characters, index, onClose, onPrev, onNext }: Props) => {
  const character = characters[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  if (!character) return null;

  return (
    <Overlay onClick={onClose} role="dialog" aria-modal="true">
      <Modal onClick={(e) => e.stopPropagation()}>
        <NavButton left onClick={onPrev} aria-label="Previous character">
          {"<"}
        </NavButton>

        <Card>
          <Hero>
            <HeroImg src={character.image} alt={character.name} />
          </Hero>

          <Details>
            <HeaderRow>
              <Title>{character.name}</Title>
              <Badge $status={character.status}>{character.status}</Badge>
            </HeaderRow>

            <Grid>
              <Item>
                <Label>ID</Label>
                <Value>{character.id}</Value>
              </Item>

              <Item>
                <Label>Gender</Label>
                <Value>{character.gender}</Value>
              </Item>

              <Item>
                <Label>Species</Label>
                <Value>{character.species || "Unknown"}</Value>
              </Item>

              <Item>
                <Label>Type</Label>
                <Value>{character.type || "—"}</Value>
              </Item>

              <Item>
                <Label>Origin</Label>
                <Value>{character.origin?.name || "Unknown"}</Value>
              </Item>

              <Item>
                <Label>Location</Label>
                <Value>{character.location?.name || "Unknown"}</Value>
              </Item>

              <ItemWide>
                <Label>Created</Label>
                <Value>{new Date(character.created).toLocaleString()}</Value>
              </ItemWide>
            </Grid>
          </Details>
        </Card>

        <NavButton right onClick={onNext} aria-label="Next character">
          {">"}
        </NavButton>

        <CloseButton onClick={onClose} aria-label="Close">
          ✕
        </CloseButton>
      </Modal>
    </Overlay>
  );
};

export default CharacterModal;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  backdrop-filter: blur(12px);
  background: rgba(0, 0, 0, 0.62);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  position: relative;
  width: min(980px, 100%);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  width: min(760px, 100%);
  border-radius: 18px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const Hero = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: rgba(255, 255, 255, 0.02);
`;

const HeroImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Details = styled.div`
  padding: 16px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 780;
`;

const Badge = styled.span<{ $status: string }>`
  flex: none;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $status }) => {
    if ($status === "Alive") return theme.colors.badgeGreenBg;
    if ($status === "Dead") return theme.colors.badgeRedBg;
    return theme.colors.badgeGrayBg;
  }};
  color: ${({ theme, $status }) => {
    if ($status === "Alive") return theme.colors.badgeGreenText;
    if ($status === "Dead") return theme.colors.badgeRedText;
    return theme.colors.badgeGrayText;
  }};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Item = styled.div`
  padding: 12px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ItemWide = styled(Item)`
  grid-column: 1 / -1;
`;

const Label = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 6px;
`;

const Value = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const NavButton = styled.button<{ left?: boolean; right?: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  ${({ left }) => (left ? "left: -56px;" : "")}
  ${({ right }) => (right ? "right: -56px;" : "")}

  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(10, 14, 24, 0.6);
  color: white;
  font-size: 28px;
  cursor: pointer;

  @media (max-width: 880px) {
    ${({ left }) => (left ? "left: 8px;" : "")}
    ${({ right }) => (right ? "right: 8px;" : "")}
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(10, 14, 24, 0.6);
  color: white;
  font-size: 18px;
  cursor: pointer;
`;