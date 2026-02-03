import React from "react";
import styled from "styled-components";
import type { Character } from "../models/Character";

type Props = {
  character: Character;
  onClick: () => void;
};

const CharacterCard = ({ character, onClick }: Props) => {
  return (
    <Card onClick={onClick} role="button" tabIndex={0}>
      <Thumb>
        <Avatar src={character.image} alt={character.name} loading="lazy" />
      </Thumb>

      <Body>
        <TopRow>
          <Name title={character.name}>{character.name}</Name>
          <Badge $status={character.status}>{character.status}</Badge>
        </TopRow>

        <MetaRow>
          <MetaLabel>Species</MetaLabel>
          <MetaValue>{character.species || "Unknown"}</MetaValue>
        </MetaRow>

        <Subtle>{character.type ? `Type: ${character.type}` : " "}</Subtle>
      </Body>
    </Card>
  );
};

export default CharacterCard;

const Card = styled.article`
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  cursor: pointer;
  overflow: hidden;
  transition: transform 140ms ease, border-color 140ms ease;

  display: flex;
  flex-direction: column;
  min-height: 320px;

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.borderHover};
  }
`;

const Thumb = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background: rgba(255, 255, 255, 0.03);
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Body = styled.div`
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const Name = styled.h3`
  margin: 0;
  font-size: 16px;
  line-height: 1.2;
  font-weight: 720;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
`;

const MetaLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const MetaValue = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtle = styled.div`
  margin-top: auto;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
  min-height: 16px;
`;