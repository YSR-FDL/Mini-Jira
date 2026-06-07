import React from "react";
import { UsersRound } from "lucide-react";
import { myTeams } from "../../data/dashboardMockData";

function getTeamInitials(name) {
  return name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function TeamsOverview() {
  return (
    <div className="card">
      <div className="cardHeader">
        <span className="cardTitle">
          <UsersRound size={15} />
          Mes Équipes
        </span>
        <button className="cardAction">Voir tout</button>
      </div>

      <div className="teamsList">
        {myTeams.map((team) => (
          <div className="teamItem" key={team.id}>
            <div className="teamAvatar">{getTeamInitials(team.name)}</div>
            <div className="teamInfo">
              <div className="teamName">{team.name}</div>
              <div className="teamMeta">
                {team.members} membres · {team.projects} projets
              </div>
            </div>
            <div className="teamProgress">{team.progression}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
