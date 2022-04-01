
export function giveDates(days, startingDate, sessionTime, noc, timeZone, frontEndOffset, extras) {

    // here frontEndOffset means gap from UTC/GMT time
    let serverOffset = -(new Date().getTimezoneOffset())

    let daySet = new Set();
    days.forEach(day => {
        daySet.add(day);
    })
    let sessionSchedule=[]
    let splits = [sessionTime.substring(0, 2), sessionTime.substring(2, 4), sessionTime.substring(4)]
    let extract = new Date(startingDate);
    let serverDate = new Date(extract.getFullYear(), extract.getMonth(), extract.getDate(), splits[0], splits[1], splits[2])
    let temp = new Date(serverDate.getTime() - (frontEndOffset - serverOffset) * 60 * 1000)
    let count = 0;
    while(count < noc){
        if(daySet.has(temp.toDateString().substring(0, 3))) {
            sessionSchedule.push({fullDate : temp.toISOString(), sessionAttended : false, timeZone, ...extras })
            count++;
        }
        temp.setDate(temp.getDate() + 1)
    }

    return sessionSchedule
}

export function showMyTime(hr, mn, sc, org_offset, my_offset){
    let org_time = new Date(2022, 1, 1, hr, mn, sc)
    let my_time = new Date(org_time.getTime() - (org_offset - my_offset) * 60 * 1000)
    return my_time
}
