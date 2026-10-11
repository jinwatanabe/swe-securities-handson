CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_md5 TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  item TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  amount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'placed',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 0
);

INSERT INTO users (email, name, password_md5, role, avatar_url, phone) VALUES
  ('alice@example.com', 'Alice',   '7abdccbea8473767e91378e37850d296', 'user',  'https://placehold.co/80', '080-1111-1111'),
  ('bob@example.com',   'Bob',     '2acba7f51acfd4fd5102ad090fc612ee', 'user',  'https://placehold.co/80', '080-2222-2222'),
  ('admin@example.com', 'Admin',   '0192023a7bbd73250516f069df18b500', 'admin', 'https://placehold.co/80', '090-0000-0000');

INSERT INTO orders (user_id, item, quantity, amount, status, note) VALUES
  (1, 'Mechanical Keyboard', 1, 12000, 'placed',    'Alice: 青軸がいい'),
  (1, 'USB-C Cable',         3,  2400, 'shipped',   'Alice: 予備用'),
  (2, 'Noise Cancel Phones', 1, 35000, 'placed',    'Bob: 通勤用'),
  (2, 'Coffee Beans 1kg',    2,  6000, 'cancelled', 'Bob: 深煎り'),
  (3, 'Server Rack',         1, 98000, 'placed',    'Admin: 社外秘 在庫移動'),
  (3, 'License Key Batch',   1,480000, 'placed',    'Admin: 社外秘 ライセンス一括購入');

INSERT INTO products (name, sku, category, stock, price) VALUES
  ('Mechanical Keyboard',   'KB-100',  'Peripherals', 120, 12000),
  ('USB-C Cable',           'CB-220',  'Cables',      540,   800),
  ('Noise Cancel Phones',   'HP-900',  'Audio',        35, 35000),
  ('Coffee Beans 1kg',      'CF-010',  'Grocery',      80,  3000),
  ('Server Rack',           'SR-042',  'Datacenter',    6, 98000),
  ('License Key Batch',     'LK-777',  'Software',     15,480000),
  ('Webcam 4K',             'WC-400',  'Peripherals',  60,  9800),
  ('Standing Desk',         'DK-050',  'Furniture',    12, 42000);
