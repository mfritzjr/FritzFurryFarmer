import { supabase } from './supabaseClient.js';

export async function saveScore(playerName, score) {
    const { error } = await supabase
        .from('leaderboard')
        .insert({
            player_name : playerName.trim(),
            score : score
        });

    if (error) {
        console.error('Error saving score:', error);
        return false;
    }

    console.log('Score saved successfully!');
    return true;
}

export async function getLeaderboard() {
    const { data, error } = await supabase
        .from('leaderboard')
        .select('player_name, score')
        .order('score', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Leaderboard error:', error);
        return [];
    }

    return data;
}