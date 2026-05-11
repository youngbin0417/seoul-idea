'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// --- Types ---
type View = 'pitch' | 'home' | 'detail' | 'explore' | 'exploreDetail' | 'community' | 'my' | 'myPreference' | 'myEnvFilter';

const activityData: Record<string, any> = {
  '러닝': {
    icon: '🏃',
    score: 85,
    status: '최적',
    desc: '매우 좋음',
    factors: [
      { label: '기온', value: 30 },
      { label: '풍속', value: 20 },
      { label: '미세먼지', value: 10 },
      { label: '자외선', value: 25 },
      { label: '습도', value: 15 }
    ],
    mosquito: { level: '쾌적', value: 12 },
    tip: '💡 "오후 6시 이후 선선한 바람, 러닝 최적 시간대"',
    places: [
      { name: '남산 둘레길', score: 85, dist: '2.1km', note: '숲길이라 자외선 차단 우수' },
      { name: '반포 한강공원', score: 72, dist: '3.5km', note: '강바람 다소 강함' }
    ]
  },
  '골프': {
    icon: '⛳',
    score: 62,
    status: '보통',
    desc: '주의 요망',
    factors: [
      { label: '풍속', value: 50 },
      { label: '기온', value: 10 },
      { label: '미세먼지', value: 10 },
      { label: '자외선', value: 20 },
      { label: '습도', value: 10 }
    ],
    mosquito: { level: '안심', value: 5 },
    tip: '💡 "풍속 6m/s 이상, 평소보다 한 클럽 더 길게 잡으세요"',
    places: [
      { name: 'A CC', score: 65, dist: '12km', note: '남풍 영향 적은 골짜기 코스' },
      { name: 'B 연습장', score: 58, dist: '2.3km', note: '실외 연습장 바람 주의' }
    ]
  },
  '산책': {
    icon: '🐕',
    score: 91,
    status: '최적',
    desc: '매우 쾌적',
    factors: [
      { label: '풍속', value: 10 },
      { label: '기온', value: 30 },
      { label: '미세먼지', value: 10 },
      { label: '자외선', value: 30 },
      { label: '습도', value: 20 }
    ],
    mosquito: { level: '보통', value: 15 },
    tip: '💡 "전 구역 바람 잔잔, 반려견과 함께하기 최적"',
    places: [
      { name: '숲마을 공원', score: 91, dist: '0.8km', note: '그늘 많고 바람 없음' },
      { name: '하늘길 산책로', score: 88, dist: '1.5km', note: '탁 트인 시야, 고도 적당' }
    ]
  }
};

// --- Components ---

const Gauge = ({ value }: { value: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="gauge-circle">
      <svg className="gauge-svg" width="120" height="120">
        <circle className="gauge-bg" cx="60" cy="60" r={radius} />
        <circle
          className="gauge-fill"
          cx="60" cy="60" r={radius}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      <div className="gauge-text">{value}%</div>
    </div>
  );
};

const FactorAnalysis = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-3 mb-3">
    <div style={{ minWidth: '70px', fontSize: '13px', fontWeight: 600 }}>{label}</div>
    <div className="factor-bar-container">
      <div className="factor-bar-fill" style={{ width: `${value}%` }} />
    </div>
    <div style={{ minWidth: '36px', fontSize: '12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{value}%</div>
  </div>
);

// --- Views ---

const PitchView = ({ onStart }: { onStart: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-in" style={{ background: '#FFFFFF' }}>
    <div className="flex-1 flex flex-col justify-center items-center">
      <div style={{ fontSize: '48px', fontWeight: 800, color: '#00D082', marginBottom: '16px' }}>ECO</div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', wordBreak: 'keep-all', lineHeight: 1.3 }}>날씨가 아니라,<br />활동의 최적을 찾습니다.</h1>
      <p style={{ color: '#4E5968' }}>Outdoor Activity Intelligence</p>
    </div>
    <button className="btn-primary" onClick={onStart}>지금 시작하기</button>
  </div>
);

const HomeView = ({ onDetail }: { onDetail: (name: string) => void }) => (
  <div className="flex-1 flex flex-col animate-slide-up">
    <header className="header">
      <div className="flex items-center gap-2" style={{ fontWeight: 700 }}>
        📍 서울시 강남구 ▼
      </div>
      <div style={{ fontSize: '20px' }}>🔔</div>
    </header>
    <main className="px-6 pb-24">
      <h2 className="section-title">오늘의 야외활동</h2>
      <p className="section-subtitle">2026.05.11 (월) 18:42</p>

      <div className="flex gap-3 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
        {[
          { name: '러닝', score: 85, status: '최적', icon: '🏃' },
          { name: '골프', score: 62, status: '보통', icon: '⛳' },
          { name: '산책', score: 91, status: '최적', icon: '🐕' },
        ].map((item, i) => (
          <div key={i} className="card" onClick={() => onDetail(item.name)} style={{ minWidth: '130px', padding: '16px', textAlign: 'center', flexShrink: 0, cursor: 'pointer' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
            <div style={{ fontWeight: 700 }}>{item.name}</div>
            <div style={{ color: item.score > 80 ? 'var(--oai-optimal)' : (item.score > 60 ? 'var(--oai-good)' : 'var(--oai-poor)'), fontWeight: 800, fontSize: '18px' }}>{item.score}점</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.status}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ height: '240px', padding: 0, position: 'relative', overflow: 'hidden', border: 'none', background: 'white' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            opacity: 0.3
          }}
        />

        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '100px', height: '100px', background: 'white', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '18px' }}>실시간 최적 장소 탐색</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>내 주변 최적의 활동 스팟 찾기</div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); (onDetail as any).onOpenMap(); }}
            style={{
              marginTop: '20px',
              background: 'var(--primary)',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '100px',
              fontWeight: 700,
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(49,130,246,0.3)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            지도 열기
          </button>
        </div>
      </div>

      {/* Environmental Dashboard */}
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>오늘의 환경 리포트</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[
          { label: '미세먼지', value: '좋음 (12)', color: '#2ECC71', icon: '💨' },
          { label: '자외선', value: '높음 (7)', color: '#FBC02D', icon: '☀️' },
          { label: '바람', value: '2.4m/s (남)', color: '#3182F6', icon: '🚩' },
          { label: '기온', value: '22.4°C', color: '#FF9800', icon: '🌡️' },
          { label: '모기지수', value: '쾌적 (14)', color: '#2ECC71', icon: '🦟' },
        ].map((item, i) => (
          <div key={i} className="card" style={{ padding: '16px', border: '1px solid #f2f4f6', boxShadow: 'none' }}>
            <div className="flex justify-between items-start">
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ color: item.color, fontSize: '12px', fontWeight: 800 }}>●</span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Community Preview */}
      <div className="flex justify-between items-end mt-32 mb-16">
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>지금 이 시각 커뮤니티</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>더보기 →</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
        {[
          { user: '러너킴', title: '오늘 한강 바람 최고!', tag: '#러닝', img: '/assets/반포한강지구.png' },
          { user: '골린이', title: '청담공원 산책로 정비됐네요', tag: '#산책', img: '/assets/청담공원.png' },
          { user: '등산왕', title: '관악산 연주대 인증샷', tag: '#등산', img: '/assets/관악산.png' },
        ].map((post, i) => (
          <div key={i} className="card" style={{ minWidth: '220px', padding: 0, overflow: 'hidden', border: '1px solid #f2f4f6', boxShadow: 'none' }}>
            <div style={{ height: '110px', width: '100%' }}>
              <img src={post.img} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>{post.tag}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{post.user}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>
);

const ExploreView = ({ onSelectCategory }: { onSelectCategory: (name: string) => void }) => (
  <div className="flex-1 flex flex-col animate-slide-up bg-[#F2F4F6]">
    <header className="header white">
      <div style={{ fontWeight: 700, fontSize: '18px' }}>탐색</div>
      <div style={{ fontSize: '20px' }}>🔔</div>
    </header>
    <main className="px-6 pb-24">

      {/* Naver-style Search Bar */}
      <div className="mt-6">
        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>어떤 활동을 찾으시나요?</h2>
        <div className="flex items-center bg-white" style={{ borderRadius: '8px', padding: '10px 16px', border: '2px solid #00D082', boxShadow: '0 4px 12px rgba(0, 208, 130, 0.08)' }}>
          <input type="text" placeholder="활동명, 장소를 검색하세요" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }} />
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D082" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        </div>
      </div>

      {/* Categories */}
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: '24px', marginBottom: '12px' }}>카테고리</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[
          { name: '러닝/트랙', icon: '🏃' },
          { name: '골프/필드', icon: '⛳' },
          { name: '등산/트레킹', icon: '⛰️' },
          { name: '자전거/라이딩', icon: '🚴' },
          { name: '반려견 산책', icon: '🐕' },
          { name: '캠핑/피크닉', icon: '⛺' }
        ].map((cat, i) => (
          <div
            key={i}
            className="card"
            onClick={() => onSelectCategory(cat.name)}
            style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0', boxShadow: 'none', border: '1px solid #eef0f2', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '24px' }}>{cat.icon}</div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{cat.name}</div>
          </div>
        ))}
      </div>

      {/* Trending */}
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: '24px', marginBottom: '12px' }}>지금 뜨는 장소</h3>
      <div className="card" style={{ padding: '16px', boxShadow: 'none', border: '1px solid #eef0f2' }}>
        <div className="flex gap-3 items-center">
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>1</div>
          <div className="flex-1">
            <div style={{ fontWeight: 700, fontSize: '15px' }}>남산 둘레길</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>러닝하기 좋은 선선한 날씨</div>
          </div>
          <div style={{ color: 'var(--oai-optimal)', fontWeight: 800 }}>92점</div>
        </div>
        <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #f2f4f6' }} />
        <div className="flex gap-3 items-center">
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-tertiary)' }}>2</div>
          <div className="flex-1">
            <div style={{ fontWeight: 700, fontSize: '15px' }}>한강공원 잠원지구</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>바람 잦아들어 피크닉 추천</div>
          </div>
          <div style={{ color: 'var(--oai-optimal)', fontWeight: 800 }}>88점</div>
        </div>
      </div>
    </main>
  </div>
);

const LeafletMap = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Fix default marker icon
    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  if (!isMounted) return null;

  return (
    <div style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}>
      <MapContainer center={[37.4979, 127.0271]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[37.4979, 127.0271]}>
          <Popup>강남역 인근 <br /> OAI 92점 (최적)</Popup>
        </Marker>
        <Marker position={[37.5172, 127.0413]}>
          <Popup>청담공원 <br /> OAI 88점 (좋음)</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

const PostCard = ({ 
  user, 
  time, 
  location, 
  content, 
  oaiScore, 
  activity, 
  imageEmoji, 
  likes, 
  comments 
}: any) => {
  return (
    <div className="card" style={{ padding: '20px', marginBottom: '16px', border: '1px solid #f2f4f6', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', background: 'white' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F2F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{user}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500 }}>{time}</div>
          </div>
        </div>
        <div style={{ padding: '6px 12px', borderRadius: '10px', background: '#F2F4F6', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>📍 {location}</span>
          <div style={{ width: '1px', height: '10px', background: '#D1D6DB' }} />
          <span style={{ fontSize: '12px', fontWeight: 800, color: oaiScore > 80 ? 'var(--oai-optimal)' : 'var(--primary)' }}>OAI {oaiScore}</span>
        </div>
      </div>

      {/* Content area */}
      <div className="mb-4">
        <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'keep-all' }}>
          {content}
        </p>
      </div>

      {/* Image box */}
      <div style={{ width: '100%', aspectRatio: '1.8/1', background: 'linear-gradient(135deg, #f5f7fa 0%, #eef1f5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
         {imageEmoji}
         <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 800, color: 'var(--primary)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            #{activity}
         </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-4">
        <div className="flex items-center" style={{ gap: '24px' }}>
          <div className="flex items-center gap-1.5" style={{ cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-tertiary)' }}>{likes}</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-tertiary)' }}>{comments}</span>
          </div>
          <div style={{ flex: 1 }} />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
        </div>
      </div>
    </div>
  );
};

const CommunityView = ({ initialTab = 'feed' }: { initialTab?: 'map' | 'feed' }) => {
  const [tab, setTab] = useState<'map' | 'feed'>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  return (
    <div className="flex-1 flex flex-col bg-[#F2F4F6] overflow-y-auto pb-24" style={{ position: 'relative' }}>

      {/* Top Tab Bar (Large, floating style) */}
      <div className="pt-safe px-6 pb-4 flex justify-between items-center z-[1001] sticky top-0 bg-[#F2F4F6]" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
        <div className="flex bg-[#E5E8EB] p-1.5 rounded-[18px] gap-1 flex-1 shadow-inner mr-3">
          <div
            onClick={() => setTab('feed')}
            className="flex-1 flex justify-center items-center gap-2"
            style={{
              padding: '12px 0',
              borderRadius: '14px',
              background: tab === 'feed' ? 'white' : 'transparent',
              boxShadow: tab === 'feed' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 800, color: tab === 'feed' ? 'var(--text-primary)' : '#8B95A1' }}>피드 보기</span>
          </div>
          <div
            onClick={() => setTab('map')}
            className="flex-1 flex justify-center items-center gap-2"
            style={{
              padding: '12px 0',
              borderRadius: '14px',
              background: tab === 'map' ? 'white' : 'transparent',
              boxShadow: tab === 'map' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 800, color: tab === 'map' ? 'var(--text-primary)' : '#8B95A1' }}>지도 보기</span>
          </div>
        </div>
        <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
        </div>
      </div>

      {tab === 'map' ? (
        // --- MAP VIEW (Instagram Location Style) ---
        <main className="px-6 flex flex-col gap-6 animate-fade-in">
          {/* MAP BOX */}
          <div className="relative overflow-hidden bg-white" style={{ borderRadius: '28px', height: '520px', boxShadow: '0 12px 40px rgba(0,0,0,0.08)', border: '1px solid #eef0f2' }}>
            <LeafletMap />
            {/* Soft overlay */}
            <div className="absolute inset-0 bg-white/5 pointer-events-none" style={{ zIndex: 400 }}></div>
          </div>

          {/* Below Map Content */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>지금 뜨는 주변 장소</h3>
            <div className="flex gap-3 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
              <div className="card" style={{ minWidth: '150px', padding: '20px', marginBottom: 0, border: '1px solid #eef0f2' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>⛳</div>
                <div style={{ fontWeight: 800, fontSize: '16px' }}>청담공원 인근</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>2.5km · 리뷰 124</div>
              </div>
              <div className="card" style={{ minWidth: '150px', padding: '20px', marginBottom: 0, border: '1px solid #eef0f2' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏃</div>
                <div style={{ fontWeight: 800, fontSize: '16px' }}>남산 둘레길</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>4.1km · 리뷰 89</div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        // --- FEED VIEW (Custom Card Style) ---
        <main className="flex-1 px-6 overflow-y-auto animate-fade-in pb-24" style={{ scrollbarWidth: 'none' }}>
          <PostCard 
            user="에코러너" 
            time="2시간 전" 
            location="남산 둘레길" 
            oaiScore={92}
            activity="러닝"
            content="오늘 남산 러닝 코스 진짜 최고네요! 바람도 적당하고 OAI 점수 92점 찍길래 바로 나왔습니다 🏃‍♂️💨"
            imageEmoji="🌳🏃"
            likes={124}
            comments={12}
          />
          
          <PostCard 
            user="골프초보" 
            time="5시간 전" 
            location="D골프장" 
            oaiScore={78}
            activity="골프"
            content="바람이 좀 불지만 칠만합니다. 14번홀 주의하세요! 잔디 상태는 아주 좋아요. ⛳☀️"
            imageEmoji="⛳☀️"
            likes={58}
            comments={4}
          />

          <PostCard 
            user="댕댕이집사" 
            time="8시간 전" 
            location="청담공원" 
            oaiScore={88}
            activity="산책"
            content="공원이 아주 한적하고 시원해요. 강아지랑 산책하기 딱 좋은 날씨입니다! 🐕🌿"
            imageEmoji="🐕🌿"
            likes={92}
            comments={7}
          />
        </main>
      )}
    </div>
  );
};

const MyPreferenceView = ({ onBack }: { onBack: () => void }) => (
  <div className="flex-1 flex flex-col bg-[#F2F4F6] animate-slide-up">
    <header className="header white sticky top-0 z-10">
      <div onClick={onBack} style={{ cursor: 'pointer', fontSize: '20px' }}>←</div>
      <div style={{ fontWeight: 700, fontSize: '18px' }}>선호 활동 설정</div>
      <div style={{ width: '24px' }}></div>
    </header>
    <main className="px-6 py-8 overflow-y-auto pb-32">
      <h2 style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1.3, marginBottom: '12px' }}>관심 있는 활동을<br />선택해 주세요.</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px' }}>나에게 꼭 맞는 활동 지수를 추천해 드릴게요.</p>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {[
          { name: '러닝', icon: '🏃', active: true },
          { name: '골프', icon: '⛳', active: true },
          { name: '산책', icon: '🐕', active: false },
          { name: '등산', icon: '⛰️', active: false },
          { name: '자전거', icon: '🚴', active: false },
          { name: '캠핑', icon: '⛺', active: false }
        ].map((act, i, arr) => (
          <div key={i} className="flex justify-between items-center" style={{ padding: '20px', borderBottom: i === arr.length - 1 ? 'none' : '1px solid #f2f4f6' }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '24px' }}>{act.icon}</span>
              <span style={{ fontSize: '16px', fontWeight: 600 }}>{act.name}</span>
            </div>
            <div style={{
              width: '46px', height: '26px', background: act.active ? 'var(--primary)' : '#E5E8EB',
              borderRadius: '100px', position: 'relative', cursor: 'pointer'
            }}>
              <div style={{
                position: 'absolute', top: '3px', left: act.active ? '23px' : '3px',
                width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'all 0.2s'
              }} />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onBack}
        className="btn-primary"
        style={{ width: '100%', marginTop: '40px', padding: '18px 0', fontSize: '16px', borderRadius: '18px' }}
      >
        저장하기
      </button>
    </main>
  </div>
);

// ─── 맞춤 환경 필터 설정 뷰 ───────────────────────────────────────────────────
type EnvFilterState = {
  pollen: boolean;
  dust: boolean;
  ozone: boolean;
  uv: boolean;
  humidity: boolean;
  wind: boolean;
  mosquito: boolean;
};

type SensitivityLevel = 'low' | 'medium' | 'high';

const MyEnvFilterView = ({ onBack }: { onBack: () => void }) => {
  const [filters, setFilters] = React.useState<EnvFilterState>({
    pollen: true,
    dust: true,
    ozone: false,
    uv: true,
    humidity: false,
    wind: false,
    mosquito: true,
  });
  const [sensitivity, setSensitivity] = React.useState<SensitivityLevel>('medium');
  const [saved, setSaved] = React.useState(false);

  const toggle = (key: keyof EnvFilterState) =>
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 900);
  };

  const filterItems: { key: keyof EnvFilterState; icon: string; label: string; desc: string }[] = [
    { key: 'pollen',   icon: '🌼', label: '꽃가루',     desc: '봄·가을 꽃가루 농도가 높을 때 알림' },
    { key: 'dust',     icon: '💨', label: '미세먼지',   desc: 'PM2.5 / PM10 나쁨 이상 시 경고' },
    { key: 'ozone',    icon: '🌫️', label: '오존',       desc: '오존 주의보 발령 시 야외 자제 안내' },
    { key: 'uv',       icon: '☀️', label: '자외선',     desc: 'UV 지수 7 이상일 때 차단 알림' },
    { key: 'humidity', icon: '💧', label: '습도',       desc: '80% 이상 고습 또는 30% 이하 건조 알림' },
    { key: 'wind',     icon: '🚩', label: '강풍',       desc: '풍속 7m/s 초과 시 야외 활동 주의' },
    { key: 'mosquito', icon: '🦟', label: '모기',       desc: '모기 활동 지수가 높을 때 야외 활동 주의' },
  ];

  const sensitivityOptions: { value: SensitivityLevel; label: string; color: string }[] = [
    { value: 'low',    label: '낮음',   color: '#2ECC71' },
    { value: 'medium', label: '보통',   color: '#FBC02D' },
    { value: 'high',   label: '민감',   color: '#FF4D4D' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F2F4F6] animate-slide-up">
      <header className="header white sticky top-0 z-10">
        <div onClick={onBack} style={{ cursor: 'pointer', fontSize: '20px' }}>←</div>
        <div style={{ fontWeight: 700, fontSize: '18px' }}>맞춤 환경 필터</div>
        <div style={{ width: '24px' }} />
      </header>

      <main className="px-6 py-6 overflow-y-auto pb-32">
        {/* 헤드 설명 */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #00D082 0%, #3182F6 100%)', border: 'none', padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>🌿</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: '6px' }}>나에게 맞는 환경 필터를 설정하세요</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>활동 지수 계산 시 내 민감도가 자동으로 반영됩니다.</div>
        </div>

        {/* 민감도 레벨 */}
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '10px', paddingLeft: '4px' }}>전체 민감도 수준</h3>
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>선택한 수준에 따라 알림 기준이 조정됩니다.</div>
          <div className="flex gap-3">
            {sensitivityOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSensitivity(opt.value)}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  borderRadius: '16px',
                  border: sensitivity === opt.value ? `2.5px solid ${opt.color}` : '2px solid #F2F4F6',
                  background: sensitivity === opt.value ? `${opt.color}18` : 'white',
                  color: sensitivity === opt.value ? opt.color : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 개별 환경 필터 */}
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '10px', paddingLeft: '4px' }}>환경 요소별 필터</h3>
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
          {filterItems.map(({ key, icon, label, desc }, i) => (
            <div
              key={key}
              onClick={() => toggle(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '18px 20px',
                borderBottom: i < filterItems.length - 1 ? '1px solid #f2f4f6' : 'none',
                cursor: 'pointer',
                background: filters[key] ? 'rgba(0,208,130,0.04)' : 'white',
                transition: 'background 0.2s',
              }}
            >
              <span style={{ fontSize: '22px', marginRight: '14px' }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{desc}</div>
              </div>
              {/* Toggle */}
              <div style={{
                width: '46px', height: '26px',
                background: filters[key] ? 'var(--primary-eco)' : '#E5E8EB',
                borderRadius: '100px',
                position: 'relative',
                flexShrink: 0,
                transition: 'background 0.2s',
              }}>
                <div style={{
                  position: 'absolute', top: '3px',
                  left: filters[key] ? '23px' : '3px',
                  width: '20px', height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  transition: 'left 0.2s',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* 알레르기 직접 입력 */}
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '10px', paddingLeft: '4px' }}>기타 알레르기·민감 항목</h3>
        <div className="card" style={{ padding: '20px', marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>해당되는 항목을 모두 선택하세요.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['견과류', '잔디', '동물 털', '곰팡이', '황사', '초미세먼지', '낙엽'].map(tag => {
              const [active, setActive] = React.useState(tag === '잔디' || tag === '황사');
              return (
                <button
                  key={tag}
                  onClick={() => setActive(a => !a)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '100px',
                    border: active ? '2px solid var(--primary-eco)' : '2px solid #E5E8EB',
                    background: active ? 'rgba(0,208,130,0.1)' : 'white',
                    color: active ? 'var(--primary-eco)' : 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {active ? '✓ ' : ''}{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '18px 0',
            fontSize: '16px',
            borderRadius: '18px',
            background: saved ? 'var(--primary-eco)' : 'var(--primary)',
            transition: 'background 0.3s',
          }}
        >
          {saved ? '✓ 저장되었습니다!' : '저장하기'}
        </button>
      </main>
    </div>
  );
};

const MyView = ({ onPreference, onEnvFilter }: { onPreference: () => void; onEnvFilter: () => void }) => (
  <div className="flex-1 flex flex-col bg-[#F2F4F6] animate-slide-up">
    <header className="header white">
      <div style={{ fontWeight: 800, fontSize: '24px' }}>마이</div>
      <div style={{ fontSize: '20px' }}>⚙️</div>
    </header>
    <main className="px-6 pb-24 overflow-y-auto">
      {/* Profile Header */}
      <div className="flex items-center gap-4 py-6">
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>👤</div>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 800 }}>에코러너 <span style={{ fontSize: '14px', color: 'var(--primary)', marginLeft: '4px' }}>Lv.4</span></div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>서울시 강남구 · 가입 124일째</div>
        </div>
      </div>

      {/* Stats */}
      {/* Settings List */}
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-tertiary)', marginTop: '24px', marginBottom: '8px', paddingLeft: '8px' }}>설정</h3>
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div onClick={onPreference} className="flex justify-between items-center" style={{ padding: '18px 20px', borderBottom: '1px solid #f2f4f6', cursor: 'pointer' }}>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>선호 활동 관리</span>
          <span style={{ color: '#8B95A1', fontSize: '20px' }}>›</span>
        </div>
        <div onClick={onEnvFilter} className="flex justify-between items-center" style={{ padding: '18px 20px', borderBottom: '1px solid #f2f4f6', cursor: 'pointer' }}>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>맞춤 환경 필터 (알레르기 등)</span>
          <span style={{ color: '#8B95A1', fontSize: '20px' }}>›</span>
        </div>
        <div className="flex justify-between items-center" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>알림 설정</span>
          <span style={{ color: '#8B95A1', fontSize: '20px' }}>›</span>
        </div>
      </div>

      <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-tertiary)', marginTop: '24px', marginBottom: '8px', paddingLeft: '8px' }}>기타</h3>
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="flex justify-between items-center" style={{ padding: '18px 20px', borderBottom: '1px solid #f2f4f6' }}>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>데이터 소스 안내</span>
          <span style={{ color: '#8B95A1', fontSize: '20px' }}>›</span>
        </div>
        <div className="flex justify-between items-center" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>앱 정보</span>
          <span style={{ color: '#8B95A1', fontSize: '14px', fontWeight: 600 }}>v1.0.0</span>
        </div>
      </div>
    </main>
  </div>
);

const DetailView = ({ name, onBack }: { name: string, onBack: () => void }) => {
  const [analyzing, setAnalyzing] = useState(true);
  const data = activityData[name] || activityData['러닝'];

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (analyzing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-fade-in" style={{ background: 'var(--bg-color)' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%' }}></div>
        <div className="mt-4" style={{ fontWeight: 'bold' }}>OAI 분석 중...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col animate-slide-up">
      <header className="header white">
        <div onClick={onBack} style={{ cursor: 'pointer', fontSize: '20px' }}>←</div>
        <div style={{ fontWeight: 700 }}>{name} 추천</div>
        <div style={{ fontSize: '20px' }}>⋮</div>
      </header>

      <main className="px-6 pb-24">
        {/* OAI Dashboard Header */}
        <div className="oai-gauge-box mt-4">
          <div style={{ fontSize: '32px' }}>{data.icon}</div>
          <div style={{ fontWeight: 700, margin: '8px 0' }}>오늘의 {name} 적합도</div>
          <div style={{ fontWeight: 800, fontSize: '20px', color: data.score > 80 ? 'var(--oai-optimal)' : 'var(--oai-good)' }}>
            {data.score}점 / {data.desc}
          </div>
          <Gauge value={data.score} />
        </div>

        {/* 24시간 OAI 그래프 */}
        <div className="card mt-4" style={{ boxShadow: 'none', border: '1px solid #eef0f2' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>24시간 OAI 예측</h3>
          <div className="flex items-end gap-2" style={{ height: '96px' }}>
            {[data.score, data.score - 10, data.score - 30, data.score - 20, data.score - 10, data.score, data.score + 5, data.score - 5].map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative overflow-hidden" style={{ background: '#f2f4f6', height: '80px', borderRadius: '4px' }}>
                  <div className="absolute bottom-0 w-full" style={{ height: `${Math.max(0, Math.min(100, s))}%`, background: s > 80 ? 'var(--oai-optimal)' : 'var(--primary)', transition: 'height 1s' }}></div>
                </div>
                <span style={{ fontSize: '10px', color: '#8b95a1' }}>{9 + i * 2}시</span>
              </div>
            ))}
          </div>
          <div style={{ height: '4px', background: '#ddd', borderRadius: '2px', marginTop: '16px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-6px', left: '10%', width: '16px', height: '16px', background: 'white', border: '2px solid var(--primary)', borderRadius: '50%' }}></div>
          </div>
        </div>

        {/* 세부 환경요소 분석 */}
        <div className="card mt-4" style={{ boxShadow: 'none', border: '1px solid #eef0f2' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>세부 환경요소 분석</h3>
          {data.factors.map((f: any, idx: number) => (
            <FactorAnalysis key={idx} label={f.label} value={f.value} />
          ))}
          
          {/* 시즌 정보 (모기 등) - 별도 표시 */}
          {data.mosquito && (
            <div style={{ marginTop: '20px', padding: '16px', background: '#F8F9FA', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🦟</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>모기 활동지수</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>5/1 ~ 10/31 시즌 정보</div>
                </div>
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '15px' }}>{data.mosquito.level}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '4px' }}>({data.mosquito.value})</span>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 rounded-xl" style={{ background: '#f0f7f4', fontSize: '13px', borderLeft: '4px solid var(--primary-eco)', color: '#2C3E50' }}>
            {data.tip}
          </div>
        </div>

        {/* 추천 장소 TOP 2 */}
        <h3 className="mt-4" style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>추천 장소 TOP 2</h3>
        <div className="card" style={{ boxShadow: 'none', border: '1px solid #eef0f2', padding: '16px' }}>
          {data.places.map((p: any, idx: number) => (
            <React.Fragment key={idx}>
              <div className="flex gap-3 items-center">
                <div style={{ fontSize: '24px' }}>{idx === 0 ? '🥇' : '🥈'}</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span style={{ fontWeight: 700 }}>{p.name}</span>
                    <span style={{ color: p.score > 80 ? 'var(--oai-optimal)' : 'var(--oai-good)', fontWeight: 800 }}>{p.score}점</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.dist} | {p.note}</div>
                  {idx === 0 && (
                    <div className="flex gap-2 mt-2">
                      <button style={{ padding: '4px 10px', fontSize: '12px', background: '#f2f4f6', border: 'none', borderRadius: '6px' }}>길찾기</button>
                      <button style={{ padding: '4px 10px', fontSize: '12px', background: '#f2f4f6', border: 'none', borderRadius: '6px' }}>상세정보</button>
                    </div>
                  )}
                </div>
              </div>
              {idx === 0 && <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #f2f4f6' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* 프로 팁 아코디언 */}
        <div className="card mt-4" style={{ boxShadow: 'none', border: '1px solid #eef0f2', padding: '16px' }}>
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '14px', fontWeight: 600 }}>▼ 오늘 풍향 고려 클럽 선택 팁</span>
          </div>
          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #f2f4f6' }} />
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '14px', fontWeight: 600 }}>▼ 14번 홀은 항상 좌측 바람 주의</span>
          </div>
        </div>

        {/* 체크리스트 */}
        <div className="card mt-4" style={{ background: '#f0f7f4', border: 'none' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>체크리스트</h3>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center"><input type="checkbox" defaultChecked /> <span style={{ fontSize: '14px' }}>자외선 차단제 (SPF50+)</span></div>
            <div className="flex gap-2 items-center"><input type="checkbox" /> <span style={{ fontSize: '14px' }}>물 500ml 이상</span></div>
            <div className="flex gap-2 items-center"><input type="checkbox" /> <span style={{ fontSize: '14px' }}>바람 방향 체크</span></div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ExploreDetailView = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const [page, setPage] = useState(1);
  const placesPerPage = 3;

  const categoryPlaces: Record<string, any[]> = {
    '러닝/트랙': [
      { name: '남산 둘레길', dist: '2.5km', score: 88, tag: '인기', img: '/assets/남산둘레길.png' },
      { name: '반포 한강지구', dist: '3.1km', score: 85, tag: '보통', img: '/assets/반포한강지구.png' },
      { name: '뚝섬 한강공원', dist: '5.4km', score: 83, tag: '추천', img: '/assets/뚝섬.png' },
    ],
    '골프/필드': [
      { name: '인서울 골프장', dist: '7.8km', score: 75, tag: '보통', img: '/assets/인서울골프장.png' },
      { name: '뉴서울 CC', dist: '15km', score: 82, tag: '인기', img: '/assets/뉴서울cc.png' },
      { name: '남양주 CC', dist: '22km', score: 68, tag: '주의', img: '/assets/남양주cc.png' },
    ],
    '등산/트레킹': [
      { name: '관악산', dist: '4.5km', score: 90, tag: '추천', img: '/assets/관악산.png' },
      { name: '청계산', dist: '5.2km', score: 82, tag: '쾌적', img: '/assets/청계산.png' },
      { name: '북한산', dist: '12km', score: 95, tag: '최적', img: '/assets/북한산.png' },
    ],
    '반려견 산책': [
      { name: '청담공원', dist: '1.2km', score: 92, tag: '최적', img: '/assets/청담공원.png' },
      { name: '양재 시민의 숲', dist: '4.5km', score: 88, tag: '인기', img: '/assets/양재시민의숲.png' },
      { name: '보라매 공원', dist: '8.2km', score: 84, tag: '보통', img: '/assets/보라매공원.png' },
    ],
    '자전거/라이딩': [
      { name: '여의도 자전거길', dist: '6.5km', score: 91, tag: '추천', img: '/assets/여의도자전거길.png' },
      { name: '중랑천 자전거길', dist: '10.2km', score: 87, tag: '인기', img: '/assets/중랑천.png' },
    ],
    '캠핑/피크닉': [
      { name: '난지 캠핑장', dist: '11km', score: 89, tag: '추천', img: '/assets/난지캠핑장.png' },
      { name: '뚝섬 피크닉존', dist: '5.4km', score: 83, tag: '보통', img: '/assets/뚝섬.png' },
    ]
  };

  const allPlaces = categoryPlaces[category] || categoryPlaces['러닝/트랙'];

  const totalPages = Math.ceil(allPlaces.length / placesPerPage);
  const currentPlaces = allPlaces.slice((page - 1) * placesPerPage, page * placesPerPage);

  return (
    <div className="flex-1 flex flex-col bg-[#F2F4F6] animate-slide-up">
      <header className="header white sticky top-0 z-10">
        <div onClick={onBack} style={{ cursor: 'pointer', fontSize: '20px' }}>←</div>
        <div style={{ fontWeight: 700, fontSize: '18px' }}>{category}</div>
        <div style={{ width: '24px' }}></div>
      </header>

      <main className="px-6 py-10 flex flex-col gap-10 overflow-y-auto pb-32 items-center">
        {currentPlaces.map((place, i) => (
          <div key={i} className="card w-full max-w-[300px] overflow-hidden" style={{ padding: 0, border: 'none', boxShadow: '0 12px 30px rgba(0,0,0,0.08)', background: 'white' }}>
            <div style={{ height: '160px', width: '100%', position: 'relative' }}>
              <img src={place.img} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 800, color: 'var(--primary-eco)' }}>{place.tag}</div>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{place.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>내 위치에서 {place.dist}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: place.score > 90 ? 'var(--oai-optimal)' : 'var(--primary-eco)' }}>{place.score}점</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>OAI Score</div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button style={{ flex: 1, padding: '12px 0', fontSize: '14px', borderRadius: '14px', background: 'var(--primary-eco)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,208,130,0.2)' }}>
                  장소 상세보기
                </button>
                <button style={{ width: '48px', height: '48px', background: '#F2F4F6', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4E5968" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination */}
        <div className="flex gap-2 mt-8">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => { setPage(i + 1); document.querySelector('main')?.scrollTo(0, 0); }}
              style={{
                width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                background: page === i + 1 ? 'var(--primary)' : 'white',
                color: page === i + 1 ? 'white' : 'var(--text-secondary)',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};


// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('pitch');
  const [selectedActivity, setSelectedActivity] = useState<string>('러닝');
  const [selectedCategory, setSelectedCategory] = useState<string>('러닝/트랙');
  const [communityInitialTab, setCommunityInitialTab] = useState<'map' | 'feed'>('feed');

  const handleOpenMap = () => {
    setCommunityInitialTab('map');
    setView('community');
  };

  const handleShowDetail = (name: string) => {
    setSelectedActivity(name);
    setView('detail');
  };

  const handleSelectCategory = (name: string) => {
    setSelectedCategory(name);
    setView('exploreDetail');
  };

  return (
    <div className="app-container">
      <div className="flex-1 flex flex-col overflow-hidden">
        {view === 'pitch' && <PitchView onStart={() => setView('home')} />}
        {view === 'home' && (
          <HomeView onDetail={Object.assign(handleShowDetail, { onOpenMap: handleOpenMap })} />
        )}
        {view === 'explore' && <ExploreView onSelectCategory={handleSelectCategory} />}
        {view === 'exploreDetail' && (
          <ExploreDetailView category={selectedCategory} onBack={() => setView('explore')} />
        )}
        {view === 'community' && <CommunityView initialTab={communityInitialTab} />}
        {view === 'my' && <MyView onPreference={() => setView('myPreference')} onEnvFilter={() => setView('myEnvFilter')} />}
        {view === 'myPreference' && <MyPreferenceView onBack={() => setView('my')} />}
        {view === 'myEnvFilter' && <MyEnvFilterView onBack={() => setView('my')} />}
        {view === 'detail' && <DetailView name={selectedActivity} onBack={() => setView('home')} />}
      </div>

      {view !== 'pitch' && (
        <nav className="bottom-nav">
          <div onClick={() => setView('home')} style={{ textAlign: 'center', opacity: view === 'home' || view === 'detail' ? 1 : 0.4, cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            <div style={{ fontSize: '10px', fontWeight: 600 }}>홈</div>
          </div>
          <div onClick={() => setView('explore')} style={{ textAlign: 'center', opacity: view === 'explore' ? 1 : 0.4, cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <div style={{ fontSize: '10px', fontWeight: 600 }}>탐색</div>
          </div>
          <div
            onClick={() => { setCommunityInitialTab('feed'); setView('community'); }}
            style={{ textAlign: 'center', opacity: view === 'community' ? 1 : 0.4, cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            <div style={{ fontSize: '10px', fontWeight: 600 }}>커뮤니티</div>
          </div>
          <div onClick={() => setView('my')} style={{ textAlign: 'center', opacity: view === 'my' ? 1 : 0.4, cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            <div style={{ fontSize: '10px', fontWeight: 600 }}>마이</div>
          </div>
        </nav>
      )}
    </div>
  );
}
