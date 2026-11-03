/** Deterministic editorial education, not real-time product listings or price recommendations. */
export const finderUses = [
  {id:'student',label:'College and learning'},
  {id:'development',label:'Java / software development'},
  {id:'remote',label:'Remote work and meetings'},
  {id:'creator',label:'Creative projects'},
] as const;
export const finderPriorities = [
  {id:'value',label:'Total value'},
  {id:'mobility',label:'Portability'},
  {id:'capacity',label:'Heavy multitasking'},
] as const;
type Use = typeof finderUses[number]['id'];
type Priority = typeof finderPriorities[number]['id'];
interface FinderProfile { title: string; summary: string; features: string[]; guide: string; note: string }
const profiles: Record<Use,FinderProfile> = {
  student:{
    title:'Balanced student laptop checklist',
    summary:'Prioritize a readable display, reliable keyboard, warranty and curriculum compatibility before processor branding.',
    features:['Check whether required university software runs on the OS','Consider 16 GB RAM if coding tools are part of your coursework','Include battery, weight, charger and repair cost in the total budget'],
    guide:'/guides/student-laptop-buying-checklist/',
    note:'An expensive GPU is not automatically necessary for lectures and standard coding exercises.'
  },
  development:{
    title:'Developer workstation checklist',
    summary:'Plan around the actual IDE, databases and container services that need to run at the same time.',
    features:['Check 16 GB vs 32 GB memory against your simultaneous workloads','Confirm SSD space and upgrade limitations','Verify Docker architecture, ports and the required operating system'],
    guide:'/guides/laptop-for-java-developers/',
    note:'Java runs across operating systems, but native libraries and enterprise tools can constrain your choice.'
  },
  remote:{
    title:'Reliable remote-work kit',
    summary:'Optimize for meeting clarity, screen comfort, stable internet and sustained desk use.',
    features:['Evaluate webcam and headset microphone samples','Confirm external display and USB-C power compatibility','Assess heat, fan noise and support in your region'],
    guide:'/guides/headphones-for-meetings-and-study/',
    note:'Listener noise cancellation does not always improve outgoing microphone clarity.'
  },
  creator:{
    title:'Creative-project machine checklist',
    summary:'Match the hardware to your actual editing applications and supported GPU acceleration.',
    features:['Verify app and plugin support on your selected operating system','Check display, storage and backup needs for project files','Compare sustained CPU/GPU performance using independent testing'],
    guide:'/guides/mac-vs-windows-for-java-development/',
    note:'The linked operating-system guide is a starting point; creative-app compatibility must be checked separately.'
  },
};
export function findGuidance(use:Use,priority:Priority):FinderProfile {
  const base=profiles[use];
  const addition:Record<Priority,{label:string,feature:string}> = {
    value:{label:'Value focus',feature:'Compare complete ownership cost, including repairs, warranty and required accessories.'},
    mobility:{label:'Portability focus',feature:'Check device-and-charger weight, actual battery tests and transport comfort.'},
    capacity:{label:'Multitasking focus',feature:'Check memory, sustained cooling and space for simultaneous applications or projects.'},
  };
  return {...base,title:`${base.title} · ${addition[priority].label}`,features:[...base.features,addition[priority].feature]};
}
