const hasOrgaPermission = (permission) => permission === 'admin' || permission === 'anim' || permission === 'entry' || permission === 'orga';

module.exports = hasOrgaPermission;