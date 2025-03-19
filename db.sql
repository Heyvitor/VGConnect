-- Criação das tabelas
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  ggr FLOAT DEFAULT 0,
  sponsor VARCHAR(255),
  type_account VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  agent_sponsor_id INTEGER NOT NULL,
  agent_id INTEGER NOT NULL REFERENCES users(id),
  agent_code VARCHAR(255) NOT NULL UNIQUE,
  agent_token VARCHAR(255) NOT NULL,
  agent_secret_key VARCHAR(255) NOT NULL,
  agent_ip_auth VARCHAR(255) NOT NULL,
  agent_type VARCHAR(255) NOT NULL CHECK (agent_type IN ('reseller', 'agent')),
  agent_secret_post VARCHAR(255) NOT NULL,
  agent_status VARCHAR(255) NOT NULL CHECK (agent_status IN ('active', 'inactive')),
  api_type VARCHAR(255) DEFAULT 'seamless',
  balance FLOAT DEFAULT 0,
  ggr FLOAT DEFAULT 0,
  currency VARCHAR(255) NOT NULL,
  endpoint VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE provider_games (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL,
  game_server_url VARCHAR(255),
  game_id VARCHAR(255) NOT NULL,
  game_name VARCHAR(255) NOT NULL,
  game_code VARCHAR(255),
  game_type VARCHAR(255),
  description TEXT,
  cover VARCHAR(255),
  technology VARCHAR(255),
  has_lobby BOOLEAN DEFAULT false,
  is_mobile BOOLEAN DEFAULT false,
  has_freespins BOOLEAN DEFAULT false,
  has_tables BOOLEAN DEFAULT false,
  only_demo BOOLEAN DEFAULT false,
  distribution VARCHAR(255) NOT NULL,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE provider_keys (
  id SERIAL PRIMARY KEY,
  salsa_url VARCHAR(255),
  salsa_pn VARCHAR(255),
  salsa_key VARCHAR(255),
  play_gaming_hall VARCHAR(255),
  play_gaming_key VARCHAR(255),
  play_gaming_login VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  provider_id INTEGER,
  session_id VARCHAR(255),
  transaction_id VARCHAR(255) NOT NULL,
  provider VARCHAR(255),
  game VARCHAR(255),
  game_uuid VARCHAR(255),
  type VARCHAR(255) NOT NULL,
  bet FLOAT DEFAULT 0,
  win FLOAT DEFAULT 0,
  refunded BOOLEAN DEFAULT false,
  round_id VARCHAR(255),
  hash VARCHAR(255),
  status INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);