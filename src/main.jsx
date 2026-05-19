import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion } from 'framer-motion';
import { Newspaper, Clock, Tag, Send, Settings, Archive, Sparkles, Building2, ChevronRight, Mail } from 'lucide-react';
import './index.css';

const mockNews = [
  { field: '정책 / 도시', title: '도심 노후 상업지 정비 지원 확대 논의', summary: '노후 상업지와 기존 상권을 대상으로 환경 개선, 보행환경 정비, 지역상권 활성화를 지원하는 정책이 논의되고 있다.', tags: ['노후상가', '도시재생', '보행환경'] },
  { field: '사회', title: '고령 인구 증가에 따른 생활권 돌봄 인프라 확충 필요성 증가', summary: '고령화가 심화되면서 병원 중심의 돌봄을 넘어 주거지 가까운 곳에서 이용 가능한 생활권 복지·돌봄 시설의 필요성이 커지고 있다.', tags: ['고령화', '생활권', '돌봄'] },
  { field: '경제 / 물류', title: '온라인 소비 증가로 도심형 물류 거점 수요 확대', summary: '소비 방식이 온라인 중심으로 이동하면서 도심 안에서 보관, 분류, 배송을 처리할 수 있는 소규모 물류 거점의 중요성이 높아지고 있다.', tags: ['도심물류', '라스트마일', '상업공간'] },
  { field: '환경', title: '폭염 대응을 위한 도시 그늘, 쉼터, 보행환경 개선 요구 확대', summary: '기후위기로 인한 폭염과 집중호우가 반복되면서 보행자를 보호하는 그늘, 캐노피, 반외부공간, 공공 쉼터의 필요성이 커지고 있다.', tags: ['기후대응', '반외부공간', '공공공간'] },
  { field: '문화 / 지역', title: '지역 상권과 관광을 연결하는 로컬 경험형 공간 주목', summary: '단순 소비보다 지역의 생활문화와 상품을 직접 경험할 수 있는 상업공간에 대한 관심이 높아지고 있다.', tags: ['로컬경험', '상업공간', '관광'] }
];

const defaultKeywords = ['도시재생', '전통시장', '공중가로', '물류', '주거', '기후대응', '공공공간'];

function KeywordPill({ children, active = true }) {
  return <span className={active ? 'pill pill-dark' : 'pill pill-light'}>{children}</span>;
}

function Card({ children, className = '' }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Button({ children, onClick, variant = 'dark' }) {
  return <button className={`button ${variant === 'light' ? 'button-light' : 'button-dark'}`} onClick={onClick}>{children}</button>;
}

function SectionTitle({ icon: Icon, title, desc }) {
  return (
    <div className="section-title">
      <div className="icon-box"><Icon size={20} /></div>
      <div>
        <h2>{title}</h2>
        {desc && <p>{desc}</p>}
      </div>
    </div>
  );
}

function App() {
  const [email, setEmail] = useState('somi@architecture.ai');
  const [project, setProject] = useState('남대문시장 C·D동 리노베이션');
  const [keywords, setKeywords] = useState(defaultKeywords);
  const [newKeyword, setNewKeyword] = useState('');
  const [briefGenerated, setBriefGenerated] = useState(true);

  const today = '2026.05.19';
  const commonFlow = useMemo(() => '오늘의 뉴스들은 공통적으로 기존 도시공간을 단순히 새로 개발하는 것이 아니라, 생활 인프라로 다시 조직하려는 흐름을 보여준다. 노후 상업지, 고령화, 도심 물류, 기후 대응, 로컬 경험은 서로 다른 이슈처럼 보이지만 모두 기존 도시조직 안에서 새로운 기능을 수용하고 연결하는 문제로 이어진다.', []);
  const impacts = [
    '기존 건축물과 도시조직을 철거하기보다, 새로운 프로그램을 삽입하고 재구성하는 리노베이션 전략이 중요해진다.',
    '주거, 상업, 물류, 돌봄, 공공공간이 분리된 시설이 아니라 하나의 생활권 안에서 복합적으로 결합될 가능성이 커진다.',
    '기후 변화에 대응하기 위해 그늘, 캐노피, 중정, 공중가로, 테라스 같은 반외부공간이 도시 인프라로 다뤄질 수 있다.',
    '건축가는 형태를 만드는 역할을 넘어 사회적 변화와 공간 프로그램 사이의 관계를 조직하는 역할을 요구받게 된다.'
  ];

  const addKeyword = () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;
    if (!keywords.includes(trimmed)) setKeywords([...keywords, trimmed]);
    setNewKeyword('');
  };

  return (
    <div className="page">
      <div className="container">
        <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="hero">
          <div>
            <div className="badge"><Clock size={14} /> 매일 오전 8시 자동 브리핑</div>
            <h1>Urban Brief AI</h1>
            <p>사회·정치·경제·환경 뉴스를 먼저 정리하고, 여러 뉴스에서 나타나는 공통 흐름이 건축 분야에 미칠 영향을 종합적으로 분석하는 건축 시사 에이전트입니다.</p>
          </div>
          <Card className="hero-card">
            <div className="mini-title"><Sparkles size={16} /> 오늘 생성된 브리핑</div>
            <div className="big-number">5개 뉴스</div>
            <p>정책, 사회, 경제, 환경, 문화 이슈를 건축적 흐름으로 재분류했습니다.</p>
            <Button variant="light" onClick={() => setBriefGenerated(true)}>브리핑 다시 생성</Button>
          </Card>
        </motion.header>

        <main className="layout">
          <aside className="side">
            <Card>
              <SectionTitle icon={Settings} title="사용자 설정" desc="에이전트가 뉴스 필터링에 사용하는 관심 정보입니다." />
              <label>수신 이메일</label>
              <div className="input-wrap"><Mail size={16} /><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <label>현재 프로젝트</label>
              <textarea value={project} onChange={(e) => setProject(e.target.value)} />
              <label>관심 키워드</label>
              <div className="pill-row">{keywords.map((keyword) => <KeywordPill key={keyword}>{keyword}</KeywordPill>)}</div>
              <div className="add-row"><input placeholder="키워드 추가" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addKeyword()} /><Button onClick={addKeyword}>추가</Button></div>
            </Card>

            <Card>
              <SectionTitle icon={Archive} title="에이전트 작동 흐름" />
              <div className="steps">
                {['사용자 관심사 저장', '매일 아침 뉴스 수집', '뉴스 요약 및 분류', '공통 사회 흐름 도출', '건축 분야 영향 종합 분석', '이메일·대시보드 전달'].map((item, idx) => (
                  <div className="step" key={item}><span>{idx + 1}</span>{item}</div>
                ))}
              </div>
            </Card>
          </aside>

          <section className="content">
            {briefGenerated && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
                <div className="brief-head">
                  <div><div className="date">{today}</div><h2>오늘의 건축 시사 브리핑</h2></div>
                  <div className="pill-row"><KeywordPill active={false}>자동 생성</KeywordPill><KeywordPill active={false}>건축 영향 분석</KeywordPill></div>
                </div>

                <SectionTitle icon={Newspaper} title="1. 오늘의 주요 뉴스" desc="뉴스는 개별 해석보다 먼저 짧게 정리합니다." />
                <div className="news-list">
                  {mockNews.map((news, idx) => (
                    <article className="news-card" key={news.title}>
                      <div className="news-meta"><span>{news.field}</span><em>0{idx + 1}</em></div>
                      <h3>{news.title}</h3><p>{news.summary}</p>
                      <div className="tag-row">{news.tags.map((tag) => <span key={tag}><Tag size={12} />{tag}</span>)}</div>
                    </article>
                  ))}
                </div>

                <hr />
                <SectionTitle icon={Sparkles} title="2. 오늘의 공통 흐름" desc="에이전트가 여러 뉴스를 묶어 하나의 사회적 흐름으로 해석합니다." />
                <div className="flow-box"><p>{commonFlow}</p></div>

                <hr />
                <SectionTitle icon={Building2} title="3. 건축 분야에 미칠 종합 영향" desc="뉴스마다 따로 해석하지 않고, 전체 흐름이 건축에 요구하는 변화를 정리합니다." />
                <div className="impact-grid">{impacts.map((impact, idx) => <div className="impact" key={impact}><b>{idx + 1}</b><p>{impact}</p></div>)}</div>

                <hr />
                <SectionTitle icon={Tag} title="4. 오늘의 설계 키워드" />
                <div className="pill-row keyword-block">{['기존 도시조직', '복합 프로그램', '생활 인프라', '반외부공간', '도심 물류', '공공공간', '리노베이션', '기후 대응'].map((k) => <KeywordPill key={k}>{k}</KeywordPill>)}</div>

                <div className="question"><div><ChevronRight size={16} /> 오늘의 건축적 질문</div><p>앞으로 건축은 새로운 형태를 만드는 것보다, 기존 도시 안에서 주거·상업·물류·돌봄·기후 대응 기능을 어떻게 함께 조직할 것인가?</p></div>
                <Button><Send size={16} /> 이메일로 브리핑 보내기</Button>
              </Card>
            </motion.div>}
          </section>
        </main>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
