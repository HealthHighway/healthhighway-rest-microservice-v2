
export const getBlogPath  = (title) => {
    const splittedArray = title.toLowerCase().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'').split(' ').filter(c => c!='')
    const path = splittedArray.join('-')

    return path;
}