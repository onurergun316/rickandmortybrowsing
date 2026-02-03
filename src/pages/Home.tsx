import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useHome } from "./useHome";
import CharacterCard from "../components/CharacterCard";
import CharacterModal from "../components/CharacterModal";
import PaginationControls from "../components/PaginationControls";
import SortControl from "../components/SortControl";

const HomePage = () => {
  const {
    page,
    info,
    loading,
    error,
    characters,
    sortOrder,
    setSortOrder,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    goToPage,
  } = useHome();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <Shell>
      <TopBar>
        <Header>
          <Title>Rick and Morty Character Browser</Title>
          <Subtitle>
            Browse Rick and Morty Characters. Public API rate limits apply.
          </Subtitle>
        </Header>

        <Right>
          <SortControl sortOrder={sortOrder} onChange={setSortOrder} />
        </Right>
      </TopBar>

      <Panel>
        <StatsRow>
          <Stat>
            Page <strong>{page}</strong>
            {info?.pages ? (
              <>
                {" "}
                of <strong>{info.pages}</strong>
              </>
            ) : null}
          </Stat>
        </StatsRow>

        {error ? (
          <ErrorBox role="alert">
            <ErrorTitle>Couldn’t load characters</ErrorTitle>
            <ErrorText>{error}</ErrorText>
            <ErrorHint>
              If you clicked back and/or forth very fast, the public API may temporarily limit you.
              Wait a few seconds and try again later.
            </ErrorHint>
          </ErrorBox>
        ) : null}

        {characters.length === 0 && loading ? (
          <LoadingBlock>
            <Spinner />
            <LoadingText>Loading characters…</LoadingText>
          </LoadingBlock>
        ) : (
          <>
            <Grid aria-busy={loading ? "true" : "false"}>
              {characters.map((c, i) => (
                <CharacterCard
                  key={c.id}
                  character={c}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </Grid>

            <PaginationControls
              page={page}
              totalPages={info?.pages ?? null}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
              onPrev={goPrev}
              onNext={goNext}
              onGoTo={goToPage}
              loading={loading}
            />
          </>
        )}
      </Panel>

      {selectedIndex !== null && (
        <CharacterModal
          characters={characters}
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => setSelectedIndex((i) => (i! > 0 ? i! - 1 : i))}
          onNext={() =>
            setSelectedIndex((i) => (i! < characters.length - 1 ? i! + 1 : i))
          }
        />
      )}
    </Shell>
  );
};

export default HomePage;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0px); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Shell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  padding: 34px 18px 22px;
`;

const TopBar = styled.div`
  max-width: 1100px;
  margin: 0 auto 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  animation: ${fadeIn} 240ms ease both;
`;

const Header = styled.div`
  min-width: 280px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(22px, 2.2vw, 32px);
  font-weight: 780;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  margin: 10px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
  line-height: 1.6;
  max-width: 72ch;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Panel = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: 18px;
  animation: ${fadeIn} 240ms ease both;

  @media (max-width: 520px) {
    padding: 14px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const Stat = styled.div`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 700;
  }
`;

const ErrorBox = styled.div`
  margin: 10px 0 14px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.25);
`;

const ErrorTitle = styled.div`
  font-size: 13px;
  font-weight: 760;
  margin-bottom: 6px;
`;

const ErrorText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorHint = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingBlock = styled.div`
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 14px;
`;

const Spinner = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 6px solid ${({ theme }) => theme.colors.border};
  border-top: 6px solid ${({ theme }) => theme.colors.accent};
  animation: ${spin} 0.85s linear infinite;
`;

const LoadingText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`;