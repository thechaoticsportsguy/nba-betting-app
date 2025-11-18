import streamlit as st
import pandas as pd
import requests
import time
# We import these inside the function to handle cloud installation
import sys
import subprocess

# --- PAGE SETUP ---
st.set_page_config(page_title="NBA Smart Better", layout="wide")

# --- SIDEBAR SETTINGS ---
st.sidebar.header("⚙️ Settings")
api_key = st.sidebar.text_input("The-Odds-API Key", value="b412e4d9246309c4aac12e3a6bdfee44", type="password")
market = st.sidebar.selectbox("Market", ["player_points", "player_rebounds", "player_assists"])
bookmaker = st.sidebar.selectbox("Sportsbook", ["draftkings", "fanduel"])
season = "2025-26"

st.title("🏀 NBA Top 20 Prop Analyzer")
st.markdown(f"**Season:** {season} | **Book:** {bookmaker.title()} | **Market:** {market}")

# --- INSTALLER FUNCTION ---
# This ensures nba_api is installed on the cloud server
@st.cache_resource
def install_dependencies():
    try:
        import nba_api
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "nba_api"])
install_dependencies()

from nba_api.stats.endpoints import playergamelog, leaguedashteamstats
from nba_api.stats.static import players

# --- FUNCTIONS ---
@st.cache_data(ttl=3600) # Cache data for 1 hour so it doesn't reload instantly
def get_league_defense():
    try:
        team_stats = leaguedashteamstats.LeagueDashTeamStats(season=season).get_data_frames()[0]
        team_stats['Def_Rank'] = team_stats['OPP_PTS'].rank(ascending=True)
        return pd.Series(team_stats.Def_Rank.values, index=team_stats.TEAM_NAME).to_dict()
    except:
        return {}

def get_odds(api_key, market, bookmaker):
    games = requests.get(
        "https://api.the-odds-api.com/v4/sports/basketball_nba/odds", 
        params={'apiKey': api_key, 'regions': 'us', 'markets': 'h2h'}
    ).json()
    
    if not games or 'message' in games: return []
    
    all_props = []
    prog_bar = st.progress(0)
    
    for i, game in enumerate(games):
        game_id = game['id']
        matchup = f"{game['away_team']} @ {game['home_team']}"
        
        r = requests.get(
            f"https://api.the-odds-api.com/v4/sports/basketball_nba/events/{game_id}/odds",
            params={'apiKey': api_key, 'regions': 'us', 'markets': market, 'bookmakers': bookmaker}
        )
        
        if r.status_code == 200:
            data = r.json()
            for bookie in data['bookmakers']:
                for m in bookie['markets']:
                    if m['key'] == market:
                        for outcome in m['outcomes']:
                            all_props.append({
                                'Player': outcome['description'],
                                'Line': outcome.get('point', 0.0),
                                'Odds': outcome['price'],
                                'Matchup': matchup
                            })
        # Update progress bar
        prog_bar.progress((i + 1) / len(games))
        time.sleep(0.1)
    
    prog_bar.empty()
    return all_props

def analyze_player(row, def_rankings, market):
    player_name = row['Player']
    line = row['Line']
    matchup = row['Matchup']
    
    nba_p = players.find_players_by_full_name(player_name)
    if not nba_p: 
        clean = player_name.replace(" Jr.", "").replace(" III", "")
        nba_p = players.find_players_by_full_name(clean)
        if not nba_p: return None
    
    pid = nba_p[0]['id']
    
    try:
        gamelog = playergamelog.PlayerGameLog(player_id=pid, season=season)
        stats = gamelog.get_data_frames()[0]
        stats['GAME_DATE'] = pd.to_datetime(stats['GAME_DATE'])
        stats = stats.sort_values(by='GAME_DATE', ascending=False)
        if stats.empty: return None
    except: return None
    
    col = 'PTS' if market == 'player_points' else 'REB'
    
    # Metrics
    last_10 = stats.head(10)
    hits = last_10[last_10[col] > line]
    hit_pct = len(hits) / len(last_10)
    
    season_avg = stats[col].mean()
    diff = season_avg - line
    
    last_3_avg = stats.head(3)[col].mean()
    momentum = 5 if last_3_avg > season_avg else 0
    
    # Defense Bonus
    def_bonus = 0
    for team, rank in def_rankings.items():
        if team in matchup and rank > 20:
            def_bonus = 5
    
    # Score
    score = (hit_pct * 100) + (diff * 2) + momentum + def_bonus
    
    return {
        'Player': player_name,
        'Smart Score': int(score),
        'Line': line,
        'Odds': row['Odds'],
        'Hit Rate': f"{len(hits)}/10",
        'Season Avg': round(season_avg, 1),
        'L3 Avg': round(last_3_avg, 1),
        'Matchup': matchup
    }

# --- MAIN APP LOGIC ---
if st.button("🚀 RUN ANALYSIS (Takes ~90 Seconds)"):
    status_text = st.empty()
    status_text.write("🛡️ Analyzing Defenses...")
    def_rankings = get_league_defense()
    
    status_text.write("💰 Fetching Odds...")
    props = get_odds(api_key, market, bookmaker)
    
    if not props:
        st.error("No odds found. Check API Key.")
    else:
        df_all = pd.DataFrame(props).drop_duplicates(subset=['Player'])
        status_text.write(f"🧠 Analyzing {len(df_all)} players... please wait.")
        
        results = []
        my_bar = st.progress(0)
        
        for i, row in df_all.iterrows():
            res = analyze_player(row, def_rankings, market)
            if res: results.append(res)
            my_bar.progress((i + 1) / len(df_all))
            time.sleep(0.1) # Rate limit safety
            
        my_bar.empty()
        status_text.empty()
        
        if results:
            df_final = pd.DataFrame(results)
            df_top20 = df_final.sort_values(by='Smart Score', ascending=False).head(20)
            
            st.success("Analysis Complete! Here are the Top 20 Bets:")
            st.dataframe(df_top20, use_container_width=True)
        else:
            st.warning("No players matched criteria.")
