// TODO: investigate probable bug in production
// const initialNames = {
//   allys: {},
//   corps: {},
//   chars: {},
//   types: {},
//   systems: {},
// }

class NamesUtils {

  extractUnknownNames(data, alreadyExistNames) {
    const all = {
      allys: {},
      corps: {},
      chars: {},
      types: {},
      systems: {},
    }

    let allNames = { ...alreadyExistNames }
    if (!alreadyExistNames.systems) {
      // alreadyExistNames is empty
      allNames = {
        allys: {},
        corps: {},
        chars: {},
        types: {},
        systems: {},
      }
    }

    // console.log('allNames:', allNames)
    if (!allNames.systems[data[0].system]) {
      all.systems[data[0].system] = 1
    }
    data.forEach(km => {
      const v = km.victim
      if (!v) {
        console.log('WTF! where is victim?', km)
      } else {
        if (v.ally && !allNames.allys[v.ally]) all.allys[v.ally] = 1
        if (v.corp && !allNames.corps[v.corp]) all.corps[v.corp] = 1
        if (v.char && !allNames.chars[v.char]) all.chars[v.char] = 1
        if (v.ship && !allNames.types[v.ship]) all.types[v.ship] = 1
        km.attackers.forEach(att => {
          if (att.ally && !allNames.allys[att.ally]) all.allys[att.ally] = 1
          if (att.corp && !allNames.corps[att.corp]) all.corps[att.corp] = 1
          if (att.char && !allNames.chars[att.char]) all.chars[att.char] = 1
          if (att.ship && !allNames.types[att.ship]) all.types[att.ship] = 1
          if (att.weap && !allNames.types[att.weap]) all.types[att.weap] = 1
        })
      }
    })
    // console.log('unknown ids:', all)
    return all
  }

  dedupAllLegacy(data, allNames) {
    const all = {
      ...allNames,
    }
    all.systems[data[0].system] = 1
    data.forEach(km => {
      const v = km.victim
      if (!v) {
        console.log('WTF! where is victim?', km)
      } else {
        if (v.ally) all.allys[v.ally] = 1
        if (v.corp) all.corps[v.corp] = 1
        if (v.char) all.chars[v.char] = 1
        if (v.ship) all.types[v.ship] = 1
        km.attackers.forEach(att => {
          if (att.ally) all.allys[att.ally] = 1
          if (att.corp) all.corps[att.corp] = 1
          if (att.char) all.chars[att.char] = 1
          if (att.ship) all.types[att.ship] = 1
          if (att.weap) all.types[att.weap] = 1
        })
      }
    })
    return all
  }

  plainIds(data) {
    const result = []
    Object.keys(data).forEach(typeKey => {
      if (typeKey !== 'chars') {
        Object.keys(data[typeKey]).forEach(id => result.push(id))
      }
    })
    // chars would be last in array
    if (data.chars) {
      Object.keys(data.chars).forEach(id => result.push(id))
    }
    return result
  }

  parseNames(data, involvedNames) {
    let names = { ...involvedNames }
    if (!involvedNames.systems) {
      // involvedNames is empty
      names = {
        allys: {},
        corps: {},
        chars: {},
        types: {},
        systems: {},
      }
    }
    return data.reduce((inv, elem) => {
      switch (elem.category) {
        case 'character':
          inv.chars[elem.id] = elem.name
          break
        case 'corporation':
          inv.corps[elem.id] = elem.name
          break
        case 'alliance':
          inv.allys[elem.id] = elem.name
          break
        case 'solar_system':
          inv.systems[elem.id] = elem.name
          break
        case 'inventory_type':
        default:
          inv.types[elem.id] = elem.name
      }
      return inv
    }, names)
  }

}

export default new NamesUtils()