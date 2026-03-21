# teammate

**[tryteammate.com](https://tryteammate.com)**

the best part about betting isn't making money — it's doing it with friends. teammate turns your iMessage group chat into a mini hedge fund that bets on sports and world events together, no app required.

built on [photon's imessage-kit](https://github.com/photon-ai/imessage-kit). the interface is your group chat. the agent is just another contact.

---

**personal utility** — your friends are already texting about the game. now the bet happens in the same thread, executed on polymarket in seconds.

**conversation-native** — no app, no link, no UI. sideline lives inside iMessage. every deposit, proposal, and vote is a text message.

**one sentence** — add sideline to your group chat, pool money with friends, and bet on sports together through polymarket, all over iMessage.

---

## how it works

1. run sideline on your Mac — it watches all your iMessage group chats
2. friends declare how much they're putting in (`deposit $50`)
3. someone proposes a bet in plain english (`bet $50 on the lakers winning tonight`)
4. the group votes yes/no — weighted by each person's share of the pool
5. 2/3 majority → sideline auto-executes the trade on polymarket
6. winnings split proportionally when the market resolves

---

## demo

don't want to add API keys? **[view live demo →](https://notandruu.github.io/sideline/demo.html)** — shows a full bet from proposal to payout with the real iMessage UI and typing animations.

---

## commands

there are no hardcoded commands. every message is parsed by claude haiku, so you can say things however you'd naturally text them.

| intent | example phrases |
|---|---|
| deposit | `im putting in 50 bucks` · `deposit $50` · `add me for 100` |
| withdraw | `pull out $20` · `withdraw 30` · `take me out` |
| browse markets | `what games are on` · `any nba markets` · `show me lakers bets` |
| propose a bet | `bet $50 on lakers winning` · `throw 30 on the celtics` · `$20 against the warriors` |
| vote yes | `yes` · `lfg` · `im in` · `bet` · `down` · `lets go` |
| vote no | `no` · `nah` · `pass` · `im out` · `hard no` |
| check status | `how much do we have` · `what bets are open` · `status` |

normal conversation (`lol`, `nice`, `fr`) is ignored — sideline stays silent unless there's betting intent.

---

## setup

```bash
cp .env.example .env
# fill in your keys (see below)
bun install
bun dev
```

**env vars:**

| var | description |
|---|---|
| `ANTHROPIC_API_KEY` | for natural language command parsing |
| `POLYGON_RPC_URL` | polygon mainnet rpc (e.g. `https://polygon-rpc.com`) |
| `MASTER_PRIVATE_KEY` | EVM private key — this wallet executes trades on polymarket |

**macOS requirement:** grant Full Disk Access to your terminal app in System Settings → Privacy & Security. this lets sideline read `~/Library/Messages/chat.db`.

---

## stack

- **runtime:** bun
- **language:** typescript
- **imessage:** `@photon-ai/imessage-kit`
- **ai parsing:** claude haiku via `@anthropic-ai/sdk` (tool_use)
- **database:** sqlite via `bun:sqlite` (local, zero infra)
- **prediction markets:** polymarket gamma api (read) + clob api (trade)
- **chain:** polygon — all positions in USDC
