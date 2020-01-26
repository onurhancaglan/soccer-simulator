$(document).ready(function () {
    var NowWeek = localStorage.getItem('NowWeek');
    var Teams = JSON.parse(localStorage.getItem('Teams'));
    //ekranda son oynanan maçların skorunun gözükmesi için NowWeek - 1 aldım

    if (NowWeek != null) {
        $('#simulatorScreen').removeClass('hidden');
        $('#engineButtons').removeClass('hidden');
        var lastWeek = NowWeek - 1;
        if (NowWeek != 1) {
            $('#finishLeague').removeClass('hidden');
            PrintFixtureTable(lastWeek);
        } else {
            PrintFixtureTable(NowWeek);
        }

        removeStartButtonDisplayResteButton();

    }
    if (Teams != null) {
        appendChampionshipChance(Teams);
    }

    if (NowWeek === 7) {
        whenLeagueEndUpdateButtons();
    }
});

function PrintFixtureTable(week) {
    appendSelectedWeekMatchesToFixtureTable(week);
    updateLeagueTable();
    $('li.week').html('<b id="weekValue">' + week + '. Week</b>');
    $('#weekNumber').html(week);
}


function playMatch(home, away) {
    var homeSurpriseChance = 0;
    var awaySurpriseChance = 0;
    var awayChance = 0;
    var homeChance = 0;

    //TAKTİKSEL AĞIRLIK
    if (home.Tactics === 'Def' && away.Tactics === 'Def') {
        if (home.Defence > away.Defence) {
            homeChance++;
            if (away.Offensive > home.Offensive) {
                awaySurpriseChance++;
            } else {
                homeChance++;
            }
        } else {
            awayChance++

            if (home.Offensive > away.Offensive) {
                homeSurpriseChance++;
            } else {
                awayChance++;
            }
        }
    };
    if (home.Tactics === 'Off' && away.Tactics === 'Off') {
        if (home.Offensive > away.Offensive) {
            homeChance++;
            if (away.Defence > home.Defence) {
                awaySurpriseChance++;
            } else {
                homeChance++;
            }
        } else {
            awayChance++;

            if (away.Defence < home.Defence) {
                homeSurpriseChance++;
            } else {
                awayChance++;
            }
        }
    };
    if (home.Tactics === 'Def' && away.Tactics === 'Off') {
        if (home.Defence > away.Offensive) {
            homeChance++;
            if (away.Defence > home.Defence) {
                awaySurpriseChance++;
            } else {
                homeChance++;
            }
        } else {
            awayChance++;

            if (away.Offensive < home.Offensive) {
                homeSurpriseChance++;
            } else {
                awayChance++;
            }
        }
    };
    if (home.Tactics === 'Off' && away.Tactics === 'Def') {
        if (home.Offensive > away.Defence) {
            homeChance++;
            if (away.Defence > home.Defence) {
                awaySurpriseChance++;
            } else {
                homeChance++;
            }
        } else {
            awayChance++;

            if (away.Defence < home.Defence) {
                homeSurpriseChance++;
            } else {
                awayChance++;
            }
        }
    };
    //EV SAHİBİ AVANTAJI
    homeChance += home.FanSupport / 2;
    home.Morale += 2;
    away.Morale -= 2;

    //MORAL
    if (home.Morale > away.Morale) {
        homeChance += 2;

    } else {
        awayChance += 2;
    }

    //KADRO KALİTESİ
    qualityDifference = home.PlayerQuality - away.PlayerQuality;
    if (home.PlayerQuality > away.PlayerQuality) {
        homeChance += 2;
        if (qualityDifference < 4) {
            awaySurpriseChance++;
        } else {
            awaySurpriseChance--;
        }
    } else {
        away.awayChance += 2;
        if (qualityDifference < 4) {
            homeSurpriseChance++;
        } else {
            homeSurpriseChance--;
        }
    }

    //HÜCUM SAVUNMA ETKİSİ
    if (home.Offensive > away.Offensive && away.Defence < home.Defence) {
        homeChance += 2;
    }
    if (home.Offensive < away.Offensive && away.Defence > home.Defence) {
        awayChance += 2;
    }
    if (home.Offensive > away.Offensive && away.Defence > home.Defence) {
        awayChance += 2;
    }

    //GOL HESAPLA
    var homeGoal;
    var awayGoal;
    if (homeChance > awayChance) {
        if (homeSurpriseChance > awaySurpriseChance) {
            homeGoal = Math.floor(Math.random() * (6 - 2)) + 2;
            awayGoal = Math.floor(Math.random() * (4 - 1)) + 1;
        } else {
            homeGoal = Math.floor(Math.random() * (5 - 2)) + 2;
            awayGoal = Math.floor(Math.random() * (4 - 1)) + 1;
        }
    } else if (homeChance < awayChance) {
        if (homeSurpriseChance < awaySurpriseChance) {
            awayGoal = Math.floor(Math.random() * (6 - 2)) + 2;
            homeGoal = Math.floor(Math.random() * (4 - 1)) + 1;
        } else {
            awayGoal = Math.floor(Math.random() * (5 - 2)) + 2;
            homeGoal = Math.floor(Math.random() * (4 - 1)) + 1;
        }
    } else {
        homeGoal = Math.floor(Math.random() * (4 - 0)) + 0;
        awayGoal = Math.floor(Math.random() * (4 - 0)) + 0;
    }
    setMatchStatics(home, away, homeGoal, awayGoal);

    updateFixture(home, away, homeGoal, awayGoal);

    championshipChance();
}

function setMatchStatics(homeTeam, awayTeam, homeGoal, awayGoal) {
    homeTeam.Played++;
    awayTeam.Played++;
    if (homeGoal > awayGoal) {
        homeTeam.Pts += 3;
        homeTeam.Win++;
        awayTeam.Lose++;
        //SONUCUN MORALE ETKİLERİ
        homeTeam.Morale += 3;
        awayTeam.Morale -= 3;
    } else if (awayGoal > homeGoal) {
        awayTeam.Pts += 3;
        awayTeam.Win++;
        homeTeam.Lose++;
        homeTeam.Morale -= 3;
        awayTeam.Morale += 3;
    } else if (homeGoal === awayGoal) {
        homeTeam.Tie++;
        awayTeam.Tie++;
        homeTeam.Pts++;
        awayTeam.Pts++;
        homeTeam.Morale += 1;
        awayTeam.Morale += 1;
    }

    homeTeam.GoalDifference += (homeGoal - awayGoal);
    awayTeam.GoalDifference += (awayGoal - homeGoal);

    updateTeams(homeTeam, awayTeam);
}

function updateTeams(homeTeam, awayTeam) {

    var updateTeams = JSON.parse(localStorage.getItem('Teams'));

    jQuery.each(updateTeams, function (i, team) {
        if (team.Name === homeTeam.Name) {
            delete updateTeams[i];
            updateTeams[i] = homeTeam;
        } else if (team.Name === awayTeam.Name) {
            delete updateTeams[i];
            updateTeams[i] = awayTeam;
        }
    });
    localStorage.setItem('Teams', JSON.stringify(updateTeams));
}


function whenLeagueEndUpdateButtons() {
    var Teams = JSON.parse(localStorage.getItem('Teams'))

    Teams.sort(function (a, b) {
        return b.Pts - a.Pts || b.GoalDifference - a.GoalDifference;
    });

    $('.btnBaslaSifirla').html('LİG SONA ERDİ!');
    $('#btnIlerle').removeClass('btn-danger');
    $('#btnIlerle').addClass('btn-success');
    $('.btnBaslaSifirla').addClass('disabled');
    $('#champmionAlert').removeClass('hidden');
    $('#champmionAlert').html('CHAMPİON ' + Teams[0].Name);
}

function getMatchToFixtureAndPlay() {
    var matchTeams = [{
        'Home': null,
        'Away': null
    }];

    var Fixture = JSON.parse(localStorage.getItem('Fixture'));
    var NowWeek = localStorage.getItem('NowWeek');
    var Teams = JSON.parse(localStorage.getItem('Teams'));

    if (NowWeek === 7) {
        whenLeagueEndUpdateButtons();
        return;
    }

    var matchTeams = [{
        'Home': null,
        'Away': null
    }];
    jQuery.each(Fixture, function (i, match) {
        if (match.Week === NowWeek) {
            jQuery.each(Teams, function (j, team) {
                if (team.Name === match.Home) {
                    matchTeams[0].Home = team;
                }
                if (team.Name === match.Away) {
                    matchTeams[0].Away = team;
                }
            });
            if (matchTeams[0].Home !== null && matchTeams[0].Away !== null) {
                playMatch(matchTeams[0].Home, matchTeams[0].Away);
                matchTeams[0].Home = null;
                matchTeams[0].Away = null;
            }
        }
    });

    if (NowWeek < 7) {
        NowWeek++;
        localStorage.setItem('NowWeek', NowWeek);
    }

    window.location.reload();
}

function forwardToNextWeek() {
    var NowWeek = localStorage.getItem('NowWeek');;

    if (NowWeek < 6) {
        NowWeek++;
        localStorage.setItem('NowWeek', NowWeek);
    }
}

function PlayAndNextWeek() {
    var NowWeek = localStorage.getItem('NowWeek');

    getMatchToFixtureAndPlay();
}

function updateFixture(homeTeam, awayTeam, homeGoal, awayGoal) {
    var updateFixtures = JSON.parse(localStorage.getItem('Fixture'));

    jQuery.each(updateFixtures, function (i, match) {
        if (match.Home === homeTeam.Name && match.Away === awayTeam.Name) {
            NowWeek = updateFixtures[i].Week;
            delete updateFixtures[i];

            updateFixtures[i] = {
                'Home': homeTeam.Name,
                'Away': awayTeam.Name,
                'Week': NowWeek,
                'HomeGoal': homeGoal,
                'AwayGoal': awayGoal
            };
        }
    });

    localStorage.setItem('Fixture', JSON.stringify(updateFixtures));
}

function championshipChance() {
    var Teams = JSON.parse(localStorage.getItem('Teams'));
    var NowWeek = localStorage.getItem('NowWeek');

    Teams.sort(function (a, b) {
        return b.Pts - a.Pts;
    });

    var first = Teams[0];
    var second = Teams[1];
    var third = Teams[2];
    var fourth = Teams[3];
    var firstVsSecond = first.Pts - second.Pts;
    var firstVsThird = first.Pts - third.Pts;
    var firstVsFourth = first.Pts - fourth.Pts;

    var requiredPointsDifferenceForChampionship;
    if (NowWeek === 4) {
        requiredPointsDifferenceForChampionship = 6;
        compareTeamsChance(firstVsFourth, firstVsSecond, firstVsThird, first, second, third, fourth, requiredPointsDifferenceForChampionship);
    }
    if (NowWeek === 5) {
        requiredPointsDifferenceForChampionship = 3;
        compareTeamsChance(firstVsFourth, firstVsSecond, firstVsThird, first, second, third, fourth, requiredPointsDifferenceForChampionship);
    }
    if (NowWeek === 6) {
        requiredPointsDifferenceForChampionship = 0;
        compareTeamsChance(firstVsFourth, firstVsSecond, firstVsThird, first, second, third, fourth, requiredPointsDifferenceForChampionship);
    }

    //update team
    localStorage.removeItem('Teams');
    localStorage.setItem('Teams', JSON.stringify(Teams));
}

function autoFinishLeague() {
    var NowWeek = localStorage.getItem('NowWeek');
    if (NowWeek === 1) {
        return;
    }
    for (NowWeek; NowWeek <= 7; NowWeek++) {
        getMatchToFixtureAndPlay();
        localStorage.setItem('NowWeek', NowWeek);
    }
}

function appendSelectedWeekMatchesToFixtureTable(week) {
    var NotTableHeader = $('#fixturesTable tr:not(.fixturHead)');

    NotTableHeader.remove();

    var Fixture = JSON.parse(localStorage.getItem('Fixture'));

    var thisWeekMatchCount = 1;

    jQuery.each(Fixture, function (i, match) {
        if (match.Week === week) {
            if (thisWeekMatchCount === 1) {
                if (match.homeGoal === null || match.awayGoal === null) {
                    $('#fixturesTable').append('<tr><td id="homeTeamUp">' + match.Home + '</td><td><input class="form-control" type="number" id="homeGoalUp" value="' + match.HomeGoal + '"></td><td>-</td><td><input class="form-control" id="awayGoalUp" type="number" value="' + match.AwayGoal + '")"></td><td id="awayTeamUp">' + match.Away + '</td></tr>');
                } else {
                    $('#fixturesTable').append('<tr><td <td id="homeTeamUp">' + match.Home + '</td><td> <input class="form-control" type="number" id="homeGoalUp" value="' + match.HomeGoal + '" ></td><td>-</td><td><input class="form-control" id="awayGoalUp" type="number" value="' + match.AwayGoal + '" ></td><td <td id="awayTeamUp">' + match.Away + '</td></tr>');
                }
                thisWeekMatchCount++;
            } else if (thisWeekMatchCount === 2) {
                $('#fixturesTable').append('<tr><td id="homeTeamDown">' + match.Home + '</td><td><input class="form-control" type="number" id="homeGoalDown" value="' + match.HomeGoal + '"></td><td>-</td><td><input class="form-control" id="awayGoalDown" type="number" value="' + match.AwayGoal + '")"></td><td id="awayTeamDown">' + match.Away + '</td></tr>');

                thisWeekMatchCount++;
            } else if (thisWeekMatchCount > 2) {
                return;
            }
        }
    });
}

function shuffleArray(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function createFixture() {
    var Fixture = [];
    var Teams = JSON.parse(localStorage.getItem('Teams'));

    var teamsCount = 4;
    var roundsCount = 6;
    var matchPerRound = 2;
    shuffleArray(Teams);
    for (var round = 0; round < roundsCount; round++) {
        for (var match = 0; match < matchPerRound; match++) {
            var home = (round + match) % (teamsCount - 1);
            var away = (teamsCount - 1 - match + round) % (teamsCount - 1);

            if (match === 0) {
                away = teamsCount - 1;
            }
            if (round > 2) {
                var Home = Teams[home].Name;
                var Away = Teams[away].Name;
            } else {
                var Home = Teams[away].Name;
                var Away = Teams[home].Name;
            }

            FixtureMatch = {
                'Home': Home,
                'Away': Away,
                'Week': round + 1,
                HomeGoal: null,
                AwayGoal: null
            };
            Fixture.push(FixtureMatch);
        };
    }
    localStorage.setItem('Fixture', JSON.stringify(Fixture));
}

function resetProgram() {
    localStorage.clear();
    window.location.reload();
}

function displayNextWeekMatches() {
    var displayingWeek = parseInt($('#weekNumber').text());

    if (displayingWeek === 6) {
        appendSelectedWeekMatchesToFixtureTable(displayingWeek);
        $('li.week').html('<b id="weekValue">' + displayingWeek + '. Week</b>');
        $('#weekNumber').html(displayingWeek);

    } else {
        displayingWeek++;
        appendSelectedWeekMatchesToFixtureTable(displayingWeek);
        $('li.week').html('<b id="weekValue">' + displayingWeek + '. Week</b>');
        $('#weekNumber').html(displayingWeek);

    }
}

function displayPreviousWeekMatches() {
    var displayingWeek = parseInt($('#weekNumber').text());

    if (displayingWeek === 1) {
        appendSelectedWeekMatchesToFixtureTable(displayingWeek);
        $('li.week').html('<b id="weekValue">' + displayingWeek + '. Week</b>');
        $('#weekNumber').html(displayingWeek);
    } else {
        displayingWeek--;
        appendSelectedWeekMatchesToFixtureTable(displayingWeek);
        $('li.week').html('<b id="weekValue">' + displayingWeek + '. Week</b>');
        $('#weekNumber').html(displayingWeek);
    }
}

function startLeague() {
    Teams = [{
            'Name': 'Fenerbahçe',
            'PlayerQuality': 16,
            'Tactics': 'Def',
            'Offensive': 14,
            'Defence': 17,
            'FanSupport': 8,
            'Win': 0,
            'Lose': 0,
            'Tie': 0,
            'Pts': 0,
            'Played': 0,
            'GoalDifference': 0,
            'Morale': 0,
            'PredictionsOfChampionship': 'soon'
        },

        {
            'Name': 'Başakşehir',
            'PlayerQuality': 12,
            'Tactics': 'Off',
            'Offensive': 16,
            'Defence': 14,
            "FanSupport": 4,
            'Win': 0,
            'Lose': 0,
            'Tie': 0,
            'Pts': 0,
            'Played': 0,
            'GoalDifference': 0,
            'Morale': 0,
            'PredictionsOfChampionship': 'soon'
        },

        {
            'Name': 'Ankaragücü',
            'PlayerQuality': 8,
            'Tactics': 'Off',
            'Offensive': 8,
            'Defence': 4,
            "FanSupport": 6,
            'Win': 0,
            'Lose': 0,
            'Tie': 0,
            'Pts': 0,
            'Played': 0,
            'GoalDifference': 0,
            'Morale': 0,
            'PredictionsOfChampionship': 'soon'
        },

        {
            'Name': 'Akhisarspor',
            'PlayerQuality': 6,
            'Tactics': 'Def',
            'Offensive': 3,
            'Defence': 10,
            "FanSupport": 2,
            'Win': 0,
            'Lose': 0,
            'Tie': 0,
            'Pts': 0,
            'Played': 0,
            'GoalDifference': 0,
            'Morale': 0,
            'PredictionsOfChampionship': 'soon'
        }
    ];

    localStorage.setItem('Teams', JSON.stringify(Teams));

    createFixture();
    appendSelectedWeekMatchesToFixtureTable(1);

    var displayWeek = $('li.week');
    displayWeek.html('<b id="weekValue">' + 1 + '. Week</b>');
    $('#weekNumber').html(1);

    updateLeagueTable()
    removeStartButtonDisplayResteButton();

    appendChampionshipChance(Teams);

    localStorage.setItem('NowWeek', 1);

    window.location.reload();
}

function updateLeagueTable() {
    var Teams = JSON.parse(localStorage.getItem('Teams'));

    Teams.sort(function (a, b) {
        return b.Pts - a.Pts || b.GoalDifference - a.GoalDifference;
    });

    for (var i = 0; i < 4; i++) {
        var rank = i + 1;
        $('#leagueTable').append('<tr><td>' + rank + '</td><td>' + Teams[i].Name + '</td><td>' + Teams[i].Pts + '</td><td>' + Teams[i].Played + '</td><td>' + Teams[i].Win + '</td><td>' + Teams[i].Tie + '</td><td>' + Teams[i].Lose + '</td><td>' + Teams[i].GoalDifference + '</td></tr>');
    }
}

function appendChampionshipChance(Teams) {
    for (i = 0; 4 > i; i++) {
        $('#championsChance').append('<tr><td>' + Teams[i].Name + '</td><td>' + Teams[i].PredictionsOfChampionship + '</td></tr>');
    }
}

function removeStartButtonDisplayResteButton() {

    $('#baslaButton').remove();
    $('.page-header').append('<button class="btn btn-danger baslaSifirlaButton" id="sifirlaButton">SIFIRLA</button>');
    //SIFIRLA BUTON
    $('.page-header').on('click', '#sifirlaButton', function () {
        var res = confirm('Sıfırlamak istediğine emin misin? Tüm veriler kaybolacak!');
        if (res === true) {
            resetProgram();
        }
    });
    appendSelectedWeekMatchesToFixtureTable
}

function compareTeamsChance(firstVsFourth, firstVsSecond, firstVsThird, first, second, third, fourth, gerekliPuanFarki) {

    if (firstVsSecond === 0) {
        second.PredictionsOfChampionship = "PROBLABLY";
        first.PredictionsOfChampionship = "PROBLABLY";
    } else if (firstVsSecond > gerekliPuanFarki) {
        second.PredictionsOfChampionship = "IMPOSSIBLE";
        first.PredictionsOfChampionship = "CHAMPİON";
    } else if (firstVsSecond < gerekliPuanFarki) {
        second.PredictionsOfChampionship = "PROBLABLY";
        first.PredictionsOfChampionship = "PROBLABLY";
    } else if (firstVsSecond === gerekliPuanFarki) {
        second.PredictionsOfChampionship = "LOW CHANCE";
        first.PredictionsOfChampionship = "HİGH CHANCE";
    }



    if (firstVsThird === 0) {
        third.PredictionsOfChampionship = "PROBLABLY";
    } else if (firstVsThird > gerekliPuanFarki) {
        third.PredictionsOfChampionship = "IMPOSSIBLE";
    } else if (firstVsThird < gerekliPuanFarki) {
        third.PredictionsOfChampionship = "MAYBE";
    } else if (firstVsThird === gerekliPuanFarki) {
        third.PredictionsOfChampionship = "LOW CHANCE";
    }



    if (firstVsFourth === 0) {
        fourth.PredictionsOfChampionship = "PROBLABLY";
    } else if (firstVsFourth > gerekliPuanFarki) {
        fourth.PredictionsOfChampionship = "IMPOSSIBLE";
    } else if (firstVsFourth < gerekliPuanFarki) {
        fourth.PredictionsOfChampionship = "MAYBE";
    } else if (firstVsFourth === gerekliPuanFarki) {
        fourth.PredictionsOfChampionship = "LOW CHANCE";
    }

}

function removeOldMatchStatics(homeTeam, awayTeam, oldHomeGoal, oldAwayGoal) {
    if (oldHomeGoal > oldAwayGoal) {
        homeTeam.Pts -= 3;
        homeTeam.Win--;
        awayTeam.Lose--;
        homeTeam.Morale -= 5;
        awayTeam.Morale += 5;
    } else if (oldAwayGoal > oldHomeGoal) {
        awayTeam.Pts -= 3;
        awayTeam.Win--;
        homeTeam.Lose--;
        homeTeam.Morale += 5;
        awayTeam.Morale -= 5;
    } else if (oldHomeGoal == oldAwayGoal) {
        homeTeam.Tie--;
        awayTeam.Tie--;
        homeTeam.Pts--;
        awayTeam.Pts--;
        homeTeam.Morale -= 2;
        awayTeam.Morale -= 2;
    }

    homeTeam.GoalDifference -= (oldHomeGoal - oldAwayGoal);
    awayTeam.GoalDifference -= (oldAwayGoal - oldHomeGoal);
}

function updateMatchScore() {
    var week = $('#weekNumber').text();
    var Fixture = JSON.parse(localStorage.getItem('Fixture'));
    var Teams = JSON.parse(localStorage.getItem('Teams'));

    var homeTeamUp = $('#homeTeamUp').text();
    var awayTeamUp = $('#awayTeamUp').text();
    var homeGoalUp = $('#homeGoalUp').val();
    var awayGoalUp = $('#awayGoalUp').val();

    var homeTeamDown = $('#homeTeamDown').text();
    var awayTeamDown = $('#awayTeamDown').text();
    var homeGoalDown = $('#homeGoalDown').val();
    var awayGoalDown = $('#awayGoalDown').val();

    jQuery.each(Fixture, function (i, match) {
        if (match.Home === homeTeamUp && match.Away === awayTeamUp && match.Week === week) {
            var oldHomeGoalUp = match.HomeGoal;
            var oldAwayGoalUp = match.AwayGoal;
            match.HomeGoal = homeGoalUp;
            match.AwayGoal = awayGoalUp;

            homeTeam = Teams.find(item => item.Name === homeTeamUp);
            awayTeam = Teams.find(item => item.Name === awayTeamUp);
            removeOldMatchStatics(homeTeam, awayTeam, oldHomeGoalUp, oldAwayGoalUp);
            setMatchStatics(homeTeam, awayTeam, homeGoalUp, awayGoalUp);
            championshipChance();
        } else if (match.Home === homeTeamDown && match.Away === awayTeamDown && match.Week === week) {
            var oldHomeGoalDown = match.HomeGoal;
            var oldAwayGoalDown = match.AwayGoal;
            match.HomeGoal = homeGoalDown;
            match.AwayGoal = awayGoalDown;

            homeTeam = Teams.find(item => item.Name === homeTeamDown);
            awayTeam = Teams.find(item => item.Name === awayTeamDown);
            removeOldMatchStatics(homeTeam, awayTeam, oldHomeGoalDown, oldAwayGoalDown);
            setMatchStatics(homeTeam, awayTeam, homeGoalDown, awayGoalDown);
            championshipChance();
        }
    });
    updateLeagueTable();
    window.location.reload(); //

    localStorage.removeItem('Fixture');
    localStorage.setItem('Fixture', JSON.stringify(Fixture));

}