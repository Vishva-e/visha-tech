/** Curated editorial differences, not live product specifications or prices. */
export interface ComparisonOption { name: string; bestFor: string }
export interface ComparisonRow { factor: string; explanation: [string, string] }
export interface ComparisonTopic {
  id: string;
  label: string;
  intro: string;
  options: [ComparisonOption, ComparisonOption];
  rows: ComparisonRow[];
  editorialNote: string;
  guideHref: string;
}
export const comparisonTopics: ComparisonTopic[] = [
  {
    id: 'ram', label: '16 GB vs 32 GB developer memory',
    intro: 'Compare typical coding workloads instead of treating RAM as a universal performance score.',
    options: [{ name: '16 GB RAM', bestFor: 'Single-service learning, focused development and lighter multitasking' },{ name: '32 GB RAM', bestFor: 'Multiple local services, containers, VMs and longer ownership horizon' }],
    rows: [
      { factor: 'IDE + one service', explanation: ['Often workable with sensible background apps', 'Extra headroom; little advantage if the workload already fits'] },
      { factor: 'Several Docker containers', explanation: ['Can become constrained as services accumulate', 'More capacity for concurrent databases and brokers'] },
      { factor: 'Upfront cost', explanation: ['Usually lower, depending on model and upgrade options', 'Usually higher; verify whether memory is soldered'] },
      { factor: 'Upgrade flexibility', explanation: ['Check available sockets; some laptops cannot be upgraded', 'Check socket or soldered status; more memory is not automatically replaceable'] },
    ],
    editorialNote: 'Actual memory requirements vary with the operating system, IDE, project size and containers.',
    guideHref: '/guides/how-much-ram-for-developers/'
  },
  {
    id: 'storage', label: 'Internal vs external SSD',
    intro: 'Storage convenience and throughput depend on how you transfer, edit and back up data.',
    options: [{ name: 'Internal SSD', bestFor: 'Operating system, daily apps, active projects and local databases' },{ name: 'External SSD', bestFor: 'Portable data transfers, archives and independent backup copies' }],
    rows: [
      { factor: 'Everyday access', explanation: ['No extra cable or connection to manage', 'Requires compatible connector and cable'] },
      { factor: 'Portability', explanation: ['Part of one computer', 'Easy to move between machines'] },
      { factor: 'Performance limits', explanation: ['Depends on internal interface and system cooling', 'Depends on port, cable, enclosure and sustained writes'] },
      { factor: 'Data safety', explanation: ['Still requires separate backups', 'Can serve as one backup destination, not a sole backup'] },
    ],
    editorialNote: 'Neither choice replaces a verified multi-copy backup strategy.',
    guideHref: '/guides/external-ssd-buying-guide/'
  },
  {
    id: 'audio', label: 'Wired vs Bluetooth headsets',
    intro: 'Prioritize microphone quality, session length and connection consistency.',
    options: [{ name: 'Wired headset', bestFor: 'Long meetings, predictable connections and no battery maintenance' },{ name: 'Bluetooth headset', bestFor: 'Freedom to move and quick switching between devices' }],
    rows: [
      { factor: 'Connection', explanation: ['Physical port or USB adapter required', 'Needs reliable pairing, supported profiles and radio conditions'] },
      { factor: 'Power', explanation: ['Normally no headset charging needed', 'Battery health and charge level matter'] },
      { factor: 'Call audio', explanation: ['Depends on actual microphone and application processing', 'May change quality/profile when microphone is active'] },
      { factor: 'Mobility', explanation: ['Cable length limits movement', 'More freedom, subject to range and interference'] },
    ],
    editorialNote: 'Noise cancellation for the listener does not guarantee microphone noise suppression.',
    guideHref: '/guides/headphones-for-meetings-and-study/'
  },
  {
    id: 'laptop', label: 'Laptop vs desktop development',
    intro: 'Choose the setup that matches your movement, service needs and upgrade priorities.',
    options: [{ name: 'Laptop', bestFor: 'Classrooms, client visits, commuting and flexible workspaces' },{ name: 'Desktop', bestFor: 'Dedicated workspaces, expansion options and sustained cooling' }],
    rows: [
      { factor: 'Mobility', explanation: ['Self-contained screen, keyboard and battery', 'Usually requires a fixed desk, monitor and peripherals'] },
      { factor: 'Upgradability', explanation: ['Highly model-specific and often limited', 'Usually more options, depending on platform and case'] },
      { factor: 'Cooling and noise', explanation: ['Thin chassis can constrain sustained loads', 'Larger cooling solutions can be configured'] },
      { factor: 'Total cost', explanation: ['Includes display and battery, but repairs can cost more', 'Remember to price monitors, peripherals and backup power'] },
    ],
    editorialNote: 'Compare the complete setup cost rather than bare computer prices.',
    guideHref: '/guides/laptop-for-java-developers/'
  },
];
