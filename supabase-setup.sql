-- =============================================
-- 「匿名で褒めよう！」アプリ Supabase セットアップSQL
-- Supabase の SQL Editor でこれを実行してください
-- =============================================

-- members テーブル
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- praises テーブル
CREATE TABLE IF NOT EXISTS praises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'slack')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス（検索高速化）
CREATE INDEX IF NOT EXISTS praises_member_id_idx ON praises(member_id);
CREATE INDEX IF NOT EXISTS praises_created_at_idx ON praises(created_at DESC);

-- RLS（Row Level Security）有効化
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE praises ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み書きできるポリシー（匿名アプリのため）
CREATE POLICY "Anyone can read members" ON members FOR SELECT USING (true);
CREATE POLICY "Anyone can insert members" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete members" ON members FOR DELETE USING (true);

CREATE POLICY "Anyone can read praises" ON praises FOR SELECT USING (true);
CREATE POLICY "Anyone can insert praises" ON praises FOR INSERT WITH CHECK (true);

-- =============================================
-- 初期メンバーデータ
-- =============================================
INSERT INTO members (name) VALUES
  ('大舘仁志'),
  ('宇都宮友之祐'),
  ('奥原美穂子'),
  ('吉池千尋'),
  ('西岡紀子'),
  ('岡本早樹'),
  ('岡田大悟'),
  ('瀬尾友里恵'),
  ('金誠俊'),
  ('野上恵里'),
  ('野井裕美'),
  ('中島碧'),
  ('若菜真穂'),
  ('江田哲也'),
  ('本山太志'),
  ('五ノ井一平'),
  ('真鍋知優'),
  ('星山かなた'),
  ('川名子紗依'),
  ('板垣琴音'),
  ('小菅広大'),
  ('永松奈央美'),
  ('竹内快斗'),
  ('高橋慶'),
  ('林崎優吾'),
  ('川道優輝'),
  ('平城舞子'),
  ('早見真由'),
  ('廣瀨弥礼'),
  ('山川優理子'),
  ('新屋敷章寛'),
  ('池田彩華'),
  ('長田太彪'),
  ('枌谷力'),
  ('今西毅寿'),
  ('金伯冠'),
  ('仲野翔也'),
  ('古口真凜'),
  ('竹村恵'),
  ('菅野那津子'),
  ('荒川翔太'),
  ('酒井琢郎'),
  ('野村輝'),
  ('小林聖子'),
  ('丸山恋'),
  ('仁尾雅子'),
  ('経営チーム'),
  ('バックオフィスチーム'),
  ('レベニューチーム'),
  ('AI/DXチーム'),
  ('Aチーム'),
  ('Bチーム'),
  ('Cチーム'),
  ('生きとし生けるもの')
ON CONFLICT (name) DO NOTHING;
