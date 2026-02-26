import sys
import subprocess
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

import pandas as pd
import requests
import streamlit as st

# --- PAGE SETUP ---
st.set_page_config(page_title="NBA Smart Better", layout="wide", page_icon="🏀")

CUSTOM_CSS = """
<style>
    .main {
        background: linear-gradient(180deg, #0b1020 0%, #111827 35%, #111827 100%);
        color: #f9fafb;
    }
    .stApp header {background: transparent;}
    .block-container {padding-top: 1.5rem; padding-bottom: 2rem; max-width: 1250px;}
    .hero-card {
        background: linear-gradient(135deg, #1f2937 0%, #111827 60%);
        border: 1px solid #374151;
        border-radius: 16px;
        padding: 1.2rem 1.4rem;
        margin-bottom: 1rem;
    }
    .meta-chip {
        display: inline-block;
        margin: 0.15rem 0.35rem 0.15rem 0;
        padding: 0.25rem 0.7rem;
        border-radius: 999px;
        font-size: 0.82rem;
        color: #d1fae5;
        border: 1px solid #065f46;
        background: rgba(6,95,70,0.25);
    }
    .warn-chip {
        color: #fef3c7;
        border: 1px solid #92400e;
        background: rgba(146,64,14,0.25);
    }
    .source-box {
        border: 1px solid #374151;
        border-radius: 12px;
        padding: 0.8rem 1rem;
        background: #0f172a;
    }
    .small-note {font-size: 0.85rem; color: #cbd5e1;}
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

SEASON = "2025-26"
MARKET_CONFIG = {
    "player_points": {"label": "Points", "column": "PTS"},
    "player_rebounds": {"label": "Rebounds", "column": "REB"},
    "player_assists": {"label": "Assists", "column": "AST"},
}

# --- DEPENDENCY INSTALLER ---
@st.cache_resource
def install_dependencies() -> None:
    try:
        import nba_api  # noqa: F401
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "nba_api"])


install_dependencies()
from nba_api.stats.endpoints import leaguedashteamstats, playergamelog  # noqa: E402
from nba_api.stats.static import players  # noqa: E402


# --- SIDEBAR ---
st.sidebar.markdown("## ⚙️ Analysis Settings")
api_key = st.sidebar.text_input(
    "The-Odds-API Key",
    value="b412e4d9246309c4aac12e3a6bdfee44",
    type="password",
    help="Keep this key private. This app uses it directly for live market data.",
)
market = st.sidebar.selectbox("Market", list(MARKET_CONFIG.keys()), format_func=lambda x: MARKET_CONFIG[x]["label"])
bookmaker = st.sidebar.selectbox("Sportsbook", ["draftkings", "fanduel"])
min_recent_games = st.sidebar.slider("Minimum games required", min_value=5, max_value=20, value=10)
min_hit_rate = st.sidebar.slider("Minimum hit-rate alert (%)", min_value=30, max_value=90, value=55)

st.markdown(
    f"""
<div class=\"hero-card\">
    <h1 style=\"margin: 0 0 0.35rem 0;\">🏀 NBA Prop Intelligence Dashboard</h1>
    <p style=\"margin: 0.1rem 0 0.8rem 0; color:#cbd5e1;\">
        Live player prop analysis with multi-source validation, data quality checks, and confidence scoring.
    </p>
    <span class=\"meta-chip\">Season: {SEASON}</span>
    <span class=\"meta-chip\">Book: {bookmaker.title()}</span>
    <span class=\"meta-chip\">Market: {MARKET_CONFIG[market]['label']}</span>
</div>
""",
    unsafe_allow_html=True,
)


def safe_get_json(url: str, params: dict, timeout: int = 20) -> Tuple[Optional[dict], Optional[str], int]:
    try:
        response = requests.get(url, params=params, timeout=timeout)
        status_code = response.status_code
        if status_code != 200:
            return None, f"HTTP {status_code}", status_code
        return response.json(), None, status_code
    except requests.RequestException as exc:
        return None, str(exc), 0


@st.cache_data(ttl=3600, show_spinner=False)
def get_league_defense(season: str) -> Dict[str, float]:
    try:
        team_stats = leaguedashteamstats.LeagueDashTeamStats(season=season).get_data_frames()[0]
        required_cols = {"TEAM_NAME", "OPP_PTS"}
        if not required_cols.issubset(set(team_stats.columns)):
            return {}
        team_stats = team_stats.dropna(subset=["TEAM_NAME", "OPP_PTS"]).copy()
        team_stats["Def_Rank"] = team_stats["OPP_PTS"].rank(ascending=True, method="min")
        return pd.Series(team_stats.Def_Rank.values, index=team_stats.TEAM_NAME).to_dict()
    except Exception:
        return {}


@st.cache_data(ttl=300, show_spinner=False)
def get_odds(api_key: str, market: str, bookmaker: str) -> Tuple[pd.DataFrame, List[str], datetime]:
    validation_notes: List[str] = []
    fetched_at = datetime.now(timezone.utc)

    games_payload, err, _ = safe_get_json(
        "https://api.the-odds-api.com/v4/sports/basketball_nba/odds",
        {"apiKey": api_key, "regions": "us", "markets": "h2h"},
    )
    if err:
        validation_notes.append(f"Failed to load NBA games list ({err}).")
        return pd.DataFrame(), validation_notes, fetched_at

    if not isinstance(games_payload, list):
        validation_notes.append("Unexpected games payload format from odds API.")
        return pd.DataFrame(), validation_notes, fetched_at

    records: List[dict] = []
    progress = st.progress(0.0)

    for idx, game in enumerate(games_payload):
        game_id = game.get("id")
        home = game.get("home_team")
        away = game.get("away_team")
        commence = game.get("commence_time")

        if not game_id or not home or not away:
            validation_notes.append("Skipped a game with missing identifiers/team names.")
            continue

        event_payload, event_err, status_code = safe_get_json(
            f"https://api.the-odds-api.com/v4/sports/basketball_nba/events/{game_id}/odds",
            {"apiKey": api_key, "regions": "us", "markets": market, "bookmakers": bookmaker},
        )

        if event_err:
            validation_notes.append(f"Skipped game {away} @ {home} ({event_err}).")
            continue

        bookmakers = event_payload.get("bookmakers", []) if isinstance(event_payload, dict) else []
        if not bookmakers:
            validation_notes.append(f"No bookmaker market data returned for {away} @ {home}.")
            continue

        for book in bookmakers:
            for market_obj in book.get("markets", []):
                if market_obj.get("key") != market:
                    continue
                for outcome in market_obj.get("outcomes", []):
                    player_name = outcome.get("description")
                    line = outcome.get("point")
                    odds_price = outcome.get("price")

                    # strict validation before display
                    if not isinstance(player_name, str) or not player_name.strip():
                        validation_notes.append(f"Rejected prop with missing player name in {away} @ {home}.")
                        continue
                    if line is None or not isinstance(line, (int, float)) or line <= 0:
                        validation_notes.append(f"Rejected invalid line for {player_name} ({line}).")
                        continue
                    if not isinstance(odds_price, (int, float)):
                        validation_notes.append(f"Rejected invalid odds price for {player_name}.")
                        continue

                    records.append(
                        {
                            "Player": player_name.strip(),
                            "Line": float(line),
                            "Odds": int(odds_price),
                            "Matchup": f"{away} @ {home}",
                            "GameTimeUTC": commence,
                            "Bookmaker": book.get("title", bookmaker.title()),
                            "OddsCheckedAtUTC": fetched_at.isoformat(),
                            "EventStatusCode": status_code,
                        }
                    )

        if games_payload:
            progress.progress(min((idx + 1) / len(games_payload), 1.0))
        time.sleep(0.08)

    progress.empty()
    if not records:
        return pd.DataFrame(), validation_notes, fetched_at

    df = pd.DataFrame(records)
    # second-pass consistency validation
    df = df.drop_duplicates(subset=["Player", "Matchup", "Line", "Odds"]).reset_index(drop=True)
    df = df[(df["Line"] > 0) & (df["Line"] < 80)]
    return df, validation_notes, fetched_at


def resolve_player_id(player_name: str) -> Optional[int]:
    candidates = [
        player_name,
        player_name.replace(" Jr.", ""),
        player_name.replace(" III", ""),
        player_name.replace(" II", ""),
    ]
    for candidate in candidates:
        matches = players.find_players_by_full_name(candidate)
        if matches:
            return matches[0]["id"]
    return None


def analyze_player(row: pd.Series, defense_rankings: Dict[str, float], market: str, min_games: int) -> Optional[dict]:
    player_name = row["Player"]
    pid = resolve_player_id(player_name)
    if not pid:
        return None

    stat_col = MARKET_CONFIG[market]["column"]
    try:
        logs = playergamelog.PlayerGameLog(player_id=pid, season=SEASON).get_data_frames()[0]
        if logs.empty or stat_col not in logs.columns or "GAME_DATE" not in logs.columns:
            return None
        logs = logs.dropna(subset=[stat_col, "GAME_DATE"]).copy()
        logs["GAME_DATE"] = pd.to_datetime(logs["GAME_DATE"], errors="coerce")
        logs = logs.dropna(subset=["GAME_DATE"]).sort_values("GAME_DATE", ascending=False)
        if len(logs) < min_games:
            return None
    except Exception:
        return None

    line = float(row["Line"])
    recent = logs.head(min_games)
    hits = recent[recent[stat_col] > line]
    hit_rate = (len(hits) / len(recent)) * 100

    season_avg = float(logs[stat_col].mean())
    l3_avg = float(logs.head(3)[stat_col].mean())
    l10_avg = float(logs.head(10)[stat_col].mean()) if len(logs) >= 10 else float(logs[stat_col].mean())

    opponent_boost = 0
    for team, rank in defense_rankings.items():
        if team in row["Matchup"] and rank > 20:
            opponent_boost = 6
            break

    trend_boost = 4 if l3_avg > season_avg else 0
    line_edge = (season_avg - line) * 2
    confidence = max(0, min(100, int(hit_rate + line_edge + trend_boost + opponent_boost)))

    data_warning = ""
    if abs(l3_avg - l10_avg) >= 8:
        data_warning = "High volatility in recent games"

    return {
        "Player": player_name,
        "Matchup": row["Matchup"],
        "Bookmaker": row["Bookmaker"],
        "Line": line,
        "Odds": row["Odds"],
        "Hit Rate %": round(hit_rate, 1),
        "Season Avg": round(season_avg, 2),
        "L10 Avg": round(l10_avg, 2),
        "L3 Avg": round(l3_avg, 2),
        "Edge vs Line": round(season_avg - line, 2),
        "Confidence Score": confidence,
        "Volatility Flag": data_warning,
        "Stats Checked Games": len(recent),
        "Odds Checked At (UTC)": row["OddsCheckedAtUTC"],
        "Game Time (UTC)": row["GameTimeUTC"],
    }


run_clicked = st.button("🚀 Run Live Analysis", type="primary", use_container_width=True)

if run_clicked:
    if not api_key.strip():
        st.error("API key is required to fetch live data.")
        st.stop()

    status = st.empty()

    status.info("Analyzing league defense context...")
    defense_rankings = get_league_defense(SEASON)

    status.info("Fetching and validating live odds...")
    odds_df, notes, odds_fetched_at = get_odds(api_key.strip(), market, bookmaker)

    if odds_df.empty:
        st.error("No valid odds were available. Please verify API key, market availability, or sportsbook coverage.")
        if notes:
            with st.expander("Validation details"):
                for n in notes:
                    st.write(f"- {n}")
        st.stop()

    status.info("Cross-checking player data and computing confidence scores...")
    deduped_props = odds_df.sort_values("Odds Checked AtUTC" if "Odds Checked AtUTC" in odds_df.columns else "OddsCheckedAtUTC", ascending=False).drop_duplicates(subset=["Player", "Matchup"])
    results: List[dict] = []
    progress = st.progress(0.0)

    for idx, (_, row) in enumerate(deduped_props.iterrows()):
        analyzed = analyze_player(row, defense_rankings, market, min_recent_games)
        if analyzed:
            results.append(analyzed)
        if len(deduped_props) > 0:
            progress.progress(min((idx + 1) / len(deduped_props), 1.0))
        time.sleep(0.05)

    progress.empty()
    status.empty()

    if not results:
        st.warning("No players passed validation and minimum game-history checks.")
        if notes:
            with st.expander("Validation details"):
                for n in notes[:80]:
                    st.write(f"- {n}")
        st.stop()

    result_df = pd.DataFrame(results).sort_values("Confidence Score", ascending=False).reset_index(drop=True)
    top_df = result_df.head(25)

    flagged_count = (top_df["Volatility Flag"] != "").sum()
    strong_count = (top_df["Hit Rate %"] >= min_hit_rate).sum()
    avg_confidence = round(float(top_df["Confidence Score"].mean()), 1)

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Validated Props", f"{len(top_df)}")
    col2.metric(f"Hit Rate ≥ {min_hit_rate}%", f"{strong_count}")
    col3.metric("Avg Confidence", f"{avg_confidence}")
    col4.metric("Volatility Flags", f"{int(flagged_count)}")

    tab_main, tab_quality, tab_sources = st.tabs(["📊 Ranked Props", "🧪 Data Quality", "🔎 Sources & Freshness"])

    with tab_main:
        styled = top_df.copy()
        st.dataframe(
            styled,
            use_container_width=True,
            hide_index=True,
            column_config={
                "Confidence Score": st.column_config.ProgressColumn("Confidence Score", min_value=0, max_value=100),
                "Hit Rate %": st.column_config.NumberColumn("Hit Rate %", format="%.1f%%"),
                "Odds": st.column_config.NumberColumn("Odds", format="%d"),
                "Line": st.column_config.NumberColumn("Line", format="%.1f"),
            },
        )
        st.caption(
            "Only validated lines and statistically analyzable players are shown. "
            "Rows with volatility flags indicate unstable short-term trends."
        )

    with tab_quality:
        with st.expander("Validation findings", expanded=True):
            if notes:
                for note in notes[:120]:
                    st.markdown(f"<span class='meta-chip warn-chip'>⚠ {note}</span>", unsafe_allow_html=True)
            else:
                st.markdown("<span class='meta-chip'>✅ No API data validation issues detected.</span>", unsafe_allow_html=True)

        invalid_or_risky = top_df[top_df["Volatility Flag"] != ""]
        if not invalid_or_risky.empty:
            st.markdown("### Flagged volatility rows")
            st.dataframe(invalid_or_risky[["Player", "Matchup", "Volatility Flag", "L3 Avg", "L10 Avg"]], use_container_width=True, hide_index=True)
        else:
            st.success("No high-volatility players in the displayed top props.")

    with tab_sources:
        st.markdown("<div class='source-box'>", unsafe_allow_html=True)
        st.markdown(f"**Odds API Fetch Time (UTC):** `{odds_fetched_at.isoformat()}`")
        st.markdown("**Live odds source:** The-Odds-API `/v4/sports/basketball_nba` endpoints.")
        st.markdown("**Player game logs source:** `nba_api` stats endpoints (official NBA stats data feeds).")
        st.markdown(
            "**Validation policy:** records are rejected when player name, line, odds, matchup, "
            "or required stat history is missing or malformed."
        )
        st.markdown("</div>", unsafe_allow_html=True)

    st.markdown(
        f"<p class='small-note'>Last completed analysis at {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}.</p>",
        unsafe_allow_html=True,
    )
