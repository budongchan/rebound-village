import { useMemo, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ReactModal from 'react-modal';

import Game from './components/Game.tsx';
import MusicButton from './components/buttons/MusicButton.tsx';
import Button from './components/buttons/Button.tsx';
import InteractButton from './components/buttons/InteractButton.tsx';
import FreezeButton from './components/FreezeButton.tsx';
import PoweredByConvex from './components/PoweredByConvex.tsx';
import { hasConvexDeployment } from './components/ConvexClientProvider.tsx';
import { MAX_HUMAN_PLAYERS } from '../convex/constants.ts';
import { reboundAgents, reboundPlayers, reboundZones } from '../data/rebound.ts';

import a16zImg from '../assets/a16z.png';
import convexImg from '../assets/convex.svg';
import starImg from '../assets/star.svg';
import helpImg from '../assets/help.svg';

export default function Home() {
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const convexReady = hasConvexDeployment();

  const enabledAgents = useMemo(
    () => reboundAgents.filter((agent) => agent.is_chat_enabled),
    [],
  );

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#161616] font-system">
      {convexReady && <PoweredByConvex />}

      <ReactModal
        isOpen={helpModalOpen}
        onRequestClose={() => setHelpModalOpen(false)}
        style={modalStyles}
        contentLabel="Help modal"
        ariaHideApp={false}
      >
        <div className="font-system">
          <h1 className="text-3xl font-bold">REBOUND VILLAGE</h1>
          <p className="mt-4">
            Convex 연결 후에는 기존 ai-town 게임 화면에서 캐릭터 이동, 대화, 활동 피드를
            확인합니다. 현재 화면은 개발 현황 확인용 대시보드입니다.
          </p>
          <p className="mt-4">
            MVP 기준 동시 휴먼 접속 목표는 {MAX_HUMAN_PLAYERS}명이며, PRD의 최초 대상자는
            동찬님과 팀원 3명입니다.
          </p>
        </div>
      </ReactModal>

      <section className="border-b border-[#d7dce5] bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff4500]">
              REBOUND AI VILLAGE
            </p>
            <h1 className="text-2xl font-black tracking-normal sm:text-3xl">개발 현황</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <StatusPill label="GitHub" value="연결됨" tone="green" />
            <StatusPill label="Build" value="통과" tone="green" />
            <StatusPill label="Convex" value={convexReady ? '연결됨' : '대기'} tone={convexReady ? 'green' : 'amber'} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-5">
          <div className="rounded-md border border-[#d7dce5] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Day 1 베이스 구축 완료</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4b5563]">
                  ai-town 포크 기반으로 프로젝트를 만들고, 리바운드 사업부/에이전트/휴먼
                  데이터 모델을 Convex 스키마와 seed 함수까지 연결했습니다.
                </p>
              </div>
              <a
                className="rounded-md bg-[#111111] px-4 py-2 text-sm font-bold text-white hover:bg-[#ff4500]"
                href="https://github.com/budongchan/rebound-village"
                target="_blank"
                rel="noreferrer"
              >
                GitHub 보기
              </a>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <Metric label="사업부" value={reboundZones.length.toString()} />
              <Metric label="AI 에이전트" value={reboundAgents.length.toString()} />
              <Metric label="휴먼" value={reboundPlayers.length.toString()} />
              <Metric label="양방향 MVP" value={enabledAgents.length.toString()} />
            </div>
          </div>

          <div className="rounded-md border border-[#d7dce5] bg-white p-5">
            <h2 className="text-lg font-bold">사업부 배치</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {reboundZones.map((zone) => (
                <div key={zone.code} className="rounded-md border border-[#d7dce5] p-4">
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded-sm" style={{ background: zone.color }} />
                    <div>
                      <p className="font-bold">{zone.name}</p>
                      <p className="text-xs text-[#6b7280]">{zone.tag}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[#4b5563]">
                    좌표 {zone.iso_x}, {zone.iso_y} / 크기 {zone.iso_w}x{zone.iso_h}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-md border border-[#d7dce5] bg-white p-5">
            <h2 className="text-lg font-bold">다음 병목</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[#374151]">
              <p>
                Convex 프로젝트 연결과 seed가 완료됐습니다. 이제 실시간 DB에 들어간 초기
                사업부/에이전트 데이터를 기준으로 게임 화면을 연결합니다.
              </p>
              <code className="block rounded-md bg-[#111111] p-3 text-xs text-white">
                npx convex run rebound:overview
              </code>
              <p>
                위 명령으로 현재 Convex 데이터 상태를 확인할 수 있습니다. 다음 단계는 기존
                ai-town 게임 렌더와 리바운드 데이터 모델을 한 화면에 붙이는 작업입니다.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-[#d7dce5] bg-white p-5">
            <h2 className="text-lg font-bold">휴먼 멤버</h2>
            <div className="mt-4 space-y-3">
              {reboundPlayers.map((player) => (
                <div key={player.auth_user_id} className="flex items-center justify-between border-b border-[#edf0f5] pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold">{player.display_name}</p>
                    <p className="text-xs text-[#6b7280]">{player.auth_user_id}</p>
                  </div>
                  <span className="rounded-sm bg-[#eef2ff] px-2 py-1 text-xs font-bold text-[#3730a3]">
                    {player.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-[#d7dce5] bg-white p-5">
            <h2 className="text-lg font-bold">게임 화면</h2>
            <p className="mt-2 text-sm leading-6 text-[#4b5563]">
              Convex URL이 생기면 아래 버튼으로 기존 ai-town 게임을 켜서 실제 시뮬레이션을
              확인합니다.
            </p>
            <button
              className="mt-4 w-full rounded-md bg-[#ff4500] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-[#c7cbd3]"
              disabled={!convexReady}
              onClick={() => setShowGame(true)}
            >
              {convexReady ? '게임 실행' : 'Convex 연결 후 실행 가능'}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-6">
        <div className="rounded-md border border-[#d7dce5] bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold">AI 에이전트 {reboundAgents.length}명</h2>
            <span className="text-sm font-bold text-[#ff4500]">비서에이전트만 MVP 양방향</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {reboundAgents.map((agent) => (
              <div key={agent.code} className="rounded-md border border-[#d7dce5] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{agent.name}</p>
                    <p className="mt-1 text-xs text-[#6b7280]">{agent.code}</p>
                  </div>
                  <span className={`rounded-sm px-2 py-1 text-xs font-bold ${agent.is_chat_enabled ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#f3f4f6] text-[#4b5563]'}`}>
                    {agent.is_chat_enabled ? 'CHAT' : 'AUTO'}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-5 text-[#4b5563]">{agent.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showGame && convexReady && (
        <section className="min-h-screen game-background p-8">
          <Game />
          <footer className="mt-4 flex flex-wrap items-center gap-3">
            <FreezeButton />
            <MusicButton />
            <Button href="https://github.com/budongchan/rebound-village" imgUrl={starImg}>
              Repo
            </Button>
            <InteractButton />
            <Button imgUrl={helpImg} onClick={() => setHelpModalOpen(true)}>
              Help
            </Button>
            <a href="https://a16z.com">
              <img className="h-8 w-8" src={a16zImg} alt="a16z" />
            </a>
            <a href="https://convex.dev/c/ai-town">
              <img className="h-8 w-20" src={convexImg} alt="Convex" />
            </a>
          </footer>
        </section>
      )}

      <ToastContainer position="bottom-right" autoClose={2000} closeOnClick theme="dark" />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#d7dce5] bg-[#f9fafb] p-4">
      <p className="text-xs font-bold text-[#6b7280]">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'green' | 'amber';
}) {
  const toneClass =
    tone === 'green' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fef3c7] text-[#92400e]';

  return (
    <span className={`rounded-sm px-3 py-2 text-xs font-black ${toneClass}`}>
      {label}: {value}
    </span>
  );
}

const modalStyles = {
  overlay: {
    backgroundColor: 'rgb(0, 0, 0, 75%)',
    zIndex: 12,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '560px',
    border: '1px solid #d7dce5',
    borderRadius: '6px',
    background: 'white',
    color: '#161616',
  },
};
