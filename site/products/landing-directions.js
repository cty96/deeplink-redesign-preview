'use strict';
const directionNames = new Set(['signal', 'system', 'proof']);
const params = new URLSearchParams(location.search);
function setDirection(value) {
  if (!directionNames.has(value)) value = 'signal';
  document.documentElement.dataset.direction = value;
  document.querySelectorAll('[data-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.choice === value)));
  const url = new URL(location.href);
  url.searchParams.set('direction', value);
  history.replaceState(null, '', url);
}
setDirection(params.get('direction'));
document.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => setDirection(button.dataset.choice)));
const deployments = [
  ['组件集成', '轻量化内嵌集成', '系统按照组件打包为镜像，可轻量化内嵌集成，业务工程直接引入组件继承使用，适配客户端轻量化场景。'],
  ['系统融合', '融入现有管控底座', '与纳管系统深度融合，嵌入管控底座，共用纳管平台存储、网关与运维体系，一体化部署统一管控，适配集群内部业务。'],
  ['独立部署', '完整独立微服务集群', '完整独立微服务集群，资源、运维、扩容完全隔离，支持多业务跨平台接入，适配大规模商用私有化场景。']
];
const tabs = [...document.querySelectorAll('[data-deploy]')];
function chooseDeployment(index, focus = false) {
  tabs.forEach((button, i) => { button.setAttribute('aria-selected', String(index === i)); button.tabIndex = index === i ? 0 : -1; });
  const panel = document.getElementById('deploy-panel');
  panel.setAttribute('aria-labelledby', tabs[index].id);
  panel.querySelector('.small-label').textContent = deployments[index][0];
  panel.querySelector('h3').textContent = deployments[index][1];
  document.getElementById('deploy-copy').textContent = deployments[index][2];
  if (focus) tabs[index].focus();
}
tabs.forEach((button, index) => {
  button.addEventListener('click', () => chooseDeployment(index));
  button.addEventListener('keydown', event => {
    const changes = { ArrowDown: (index + 1) % 3, ArrowUp: (index + 2) % 3, Home: 0, End: 2 };
    if (Object.hasOwn(changes, event.key)) { event.preventDefault(); chooseDeployment(changes[event.key], true); }
  });
});
const cases = [
  ['仪电', '智算云平台融合了DeepLink能力，支持多个集群间的混训混推任务；并依靠DeepLink跨集群异构能力，实现与其他集群异构混训能力。'],
  ['联通', '携手实现全球首个跨1500km的千公里跨域异构混训验证项目，并在跨域异构条件下，完成垂域模型训练。此外，在“联通星罗”平台多区域调度与高速跨域网络的算网条件下，实现异构算力的统一编排与混合训练、不同区域算力的动态汇聚与弹性拼接。'],
  ['湖南省算力调度平台', '集成DeepLink跨域异构混训标准方案，树立与智算服务平台合作模式。']
];
document.querySelectorAll('[data-case]').forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.case);
  document.querySelectorAll('[data-case]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.getElementById('case-name').textContent = cases[index][0];
  document.getElementById('case-copy').textContent = cases[index][1];
}));
