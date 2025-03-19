
document.getElementById('matchForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const matchData = {
        equipe1: document.getElementById('equipe1').value,
        equipe2: document.getElementById('equipe2').value,
        butsEquipe1: document.getElementById('butsEquipe1').value,
        butsEquipe2: document.getElementById('butsEquipe2').value
    };
    
    const response = await fetch('http://localhost:9100/matchs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
    });
    
    if (response.ok) {
        alert('Match enregistré avec succès !');
        document.getElementById('matchForm').reset();
    } else {
        alert('Erreur lors de l\'enregistrement');
    }
});