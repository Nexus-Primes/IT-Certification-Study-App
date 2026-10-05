(function () {
  'use strict';
  window.APLUS_GUIDE = [
  {
    "domain": "c1d1",
    "overview": "Laptops and mobile devices bring the same core hardware concepts as a desktop, but wrapped in tighter physical constraints, proprietary parts, and a much bigger emphasis on connectivity and organizational management. This chapter covers what's different about supporting them.",
    "sections": [
      {
        "heading": "Laptop internals",
        "objectives": ["1.1"],
        "body": "Laptop batteries are almost always lithium-ion, rated in watt-hours, and — unlike most other laptop components — they degrade with age and charge cycles regardless of how carefully they're used, which is why battery replacement is one of the most common laptop repairs. Memory in a laptop is typically SODIMM (a smaller physical form factor than a desktop DIMM) and, on many modern thin laptops, soldered directly to the motherboard, which means 'just add more RAM' isn't always an option the way it is on a desktop.\n\nStorage follows the same trend toward compact, often non-removable formats — M.2 NVMe drives in particular. Wireless cards handle Wi-Fi and Bluetooth and are usually a small, replaceable module, though increasingly soldered on ultraportables too. Physical privacy features like a webcam privacy shutter or a privacy screen filter (which narrows the viewing angle so only someone directly in front of the screen can read it) matter more on a device that regularly travels into public, unsecured environments than they would on a desktop that never leaves an office."
      },
      {
        "heading": "Laptop displays",
        "objectives": ["1.2"],
        "body": "LCD displays require a separate backlight to produce visible light; OLED displays are self-illuminating pixel by pixel, which gives them true blacks and better contrast but historically at higher cost and with a risk of burn-in from static images displayed too long. A laptop's Wi-Fi antennas are frequently routed through the display bezel, not the base, since that position offers a clearer, more elevated line of sight — which is a detail worth knowing if you're troubleshooting sudden wireless problems after a display was replaced or the hinge was damaged.\n\nWebcams and microphones are typically integrated directly into the display bezel now rather than sold as separate peripherals. A digitizer is the touch-sensitive layer on a touchscreen or convertible laptop that translates a finger or stylus touch into input — it's a physically separate layer from the LCD/OLED panel underneath it, which is why a cracked digitizer and a cracked display panel are sometimes two entirely separate repairs, even though they look like the same problem from the outside."
      },
      {
        "heading": "Accessories and ports",
        "objectives": ["1.3"],
        "body": "USB-C is a physical connector shape, not a guarantee of any particular capability — a USB-C port might support anything from basic USB data transfer up through Thunderbolt speeds and video output, entirely depending on what the specific port was actually designed to do. Thunderbolt uses the same USB-C connector but adds much higher bandwidth and the ability to daisy-chain multiple high-speed devices or drive external displays, which is why 'it's USB-C' alone doesn't tell you what a given port or cable is actually capable of.\n\nA docking station lets a laptop connect to multiple peripherals — external monitors, a wired network, extra USB devices — through a single cable, which is especially useful for a laptop that regularly moves between a desk setup and being carried around. A stylus provides more precise input than a finger on a touchscreen or digitizer, valuable for drawing or handwriting-style input. A port replicator does a similar job to a docking station but is typically simpler, offering basic port expansion rather than the more advanced capabilities (higher-power charging, multiple 4K outputs) a full dock provides."
      },
      {
        "heading": "Mobile connectivity",
        "objectives": ["1.4"],
        "body": "Bluetooth is a short-range wireless standard for connecting peripherals — headphones, keyboards, mice — directly to a device without cables. NFC (Near Field Communication) works at an even shorter range, essentially requiring devices to touch or nearly touch, and is what powers tap-to-pay and quick device pairing. A mobile hotspot lets a phone share its cellular data connection with other devices over Wi-Fi, effectively turning the phone into a small wireless router — useful troubleshooting knowledge when a laptop needs internet access and no other network is available.\n\nA SIM card physically identifies a device to a cellular carrier and stores subscriber information; an eSIM does the same job digitally, built into the device rather than a removable physical card, which is increasingly common on newer phones and some laptops. Location services use a combination of GPS, Wi-Fi network positioning, and cell tower triangulation to determine a device's physical location — useful for navigation and device-recovery features, but also a genuine privacy consideration worth understanding when configuring a device for someone else."
      },
      {
        "heading": "Mobile device management",
        "objectives": ["1.5"],
        "body": "MDM (Mobile Device Management) software lets an organization enforce security policy on mobile devices remotely — requiring encryption and screen locks, pushing configuration, and remotely wiping a lost or stolen device — without an IT technician needing to physically handle every device. Synchronization keeps data (contacts, calendar, files) consistent across a user's multiple devices automatically, usually through a cloud service, so a change made on a phone shows up on a laptop without any manual transfer.\n\nData caps — a limit on how much cellular data a plan allows before extra charges or throttling kick in — matter practically because a device that's normally on Wi-Fi can burn through a cap unexpectedly fast if it fails over to cellular data without the user noticing. Corporate apps are applications an organization deploys and manages specifically for work use, often through the same MDM system. BYOD (Bring Your Own Device) policy governs how personally-owned devices are allowed to access organizational resources — a genuine balancing act between employee convenience/privacy and the organization's need to actually secure its data, which is exactly why BYOD policy is a recurring, practical topic rather than just a checkbox."
      }
    ]
  },
  {
    "domain": "c1d2",
    "overview": "This is A+'s foundational networking domain — the practical, get-a-device-online knowledge every technician needs, distinct from (and less deep than) the dedicated Network+ certification. It covers protocols, wireless basics, addressing, devices, home networking, and the different ways an internet connection actually reaches a building.",
    "sections": [
      {
        "heading": "Ports and protocols",
        "objectives": ["2.1"],
        "body": "TCP and UDP are the two transport protocols nearly everything else runs on top of. TCP is connection-oriented and guarantees delivery and order, at the cost of some overhead — used where correctness matters most. UDP just sends data with no delivery guarantee, favored where speed matters more than occasional loss. A technician doesn't need Network+-level depth here, but does need to recognize the common protocols and their default ports on sight: FTP (20/21) transfers files; SSH (22) provides secure encrypted remote command-line access; DNS (53) resolves names to IP addresses; DHCP (67/68) automatically assigns IP configuration to devices joining a network; HTTPS (443) is encrypted web traffic, the secure counterpart to plain HTTP (80).\n\nRecognizing these on sight matters constantly in real troubleshooting — 'the website won't load' could mean a DNS problem, an HTTPS/certificate problem, or something else entirely, and knowing which port and protocol is actually involved narrows down where to look first."
      },
      {
        "heading": "Wireless technologies",
        "objectives": ["2.2"],
        "body": "Wi-Fi operates across three frequency bands with real tradeoffs: 2.4GHz has the longest range and best wall penetration but is slower and more congested; 5GHz is faster with more available channels but shorter range; 6GHz (Wi-Fi 6E and newer) is fastest and least congested but has the shortest range of the three. A channel is a specific slice of a band a wireless network operates on — picking a less-crowded channel is a common, effective fix for a slow or unstable wireless connection in a crowded environment like an apartment building.\n\nBluetooth and NFC both cover short-range wireless — Bluetooth for peripherals like headphones and keyboards, NFC for near-touching interactions like tap-to-pay. RFID (Radio-Frequency Identification) is a related but distinct technology, commonly used for asset tracking and access badges — the tag itself typically needs no battery, drawing just enough power from the reader's signal to transmit its ID back."
      },
      {
        "heading": "Network services and configuration",
        "objectives": ["2.3", "2.4"],
        "body": "DNS translates human-friendly names into IP addresses; DHCP automatically hands out IP configuration to devices as they join a network, saving every device from needing manual setup. A VPN (Virtual Private Network) creates an encrypted tunnel over an otherwise untrusted network (like public Wi-Fi), letting traffic travel securely and often letting a remote device appear to be on a private network it's physically nowhere near. NTP (Network Time Protocol) keeps device clocks synchronized — a detail that sounds trivial but that breaks authentication and certificate validation in strange, hard-to-diagnose ways when it drifts. Syslog centralizes log messages from multiple devices to one server, and AAA (Authentication, Authorization, Accounting) is the three-part framework for controlling and recording who can do what.\n\nOn addressing, IPv4 is the addressing scheme most networks still primarily run on, using a 32-bit address like 192.168.1.10; IPv6 is the much larger successor address space designed to solve IPv4's exhaustion, using a longer hexadecimal format. APIPA is the self-assigned 169.254.x.x address a Windows device falls back to when DHCP fails — seeing it is a strong diagnostic clue that DHCP, not general connectivity, is the actual problem. The subnet mask defines which portion of an address is the network versus the host, and the gateway is the device (usually a router) traffic gets sent to whenever the destination isn't on the local network."
      },
      {
        "heading": "Network devices and SOHO networking",
        "objectives": ["2.5", "2.6"],
        "body": "A router connects separate networks and forwards traffic based on IP address, most commonly connecting a home or business network to the internet. A switch connects devices within one local network. An access point extends Wi-Fi coverage from a wired network. A firewall filters traffic based on rules, permitting or blocking it to protect a network's boundary. SDN (Software-Defined Networking) separates a network's control logic from its physical hardware, letting it be managed centrally through software — more common in larger environments than a typical SOHO setup, but worth recognizing as a concept.\n\nFor small office/home office (SOHO) networking specifically, the SSID is the broadcast name of a wireless network, and WPA3 is the current standard for securing it. A guest network isolates visitor devices from the main network, so a guest's device can reach the internet without being able to see or interact with anything else on the network. Port forwarding directs incoming traffic on a specific port to a specific internal device, commonly used to let something like a home security camera or game server be reached from outside the network. Keeping router firmware updated closes known vulnerabilities the same way OS patching does — a frequently overlooked task on consumer routers precisely because they're often set up once and never touched again."
      },
      {
        "heading": "Internet connection types",
        "objectives": ["2.7"],
        "body": "Fiber delivers the fastest and most reliable connections, using light instead of electrical signals, largely immune to the electrical interference that affects copper — but it isn't available everywhere due to the cost of running new fiber infrastructure. Cable internet runs over the same coaxial infrastructure as cable television, offering solid speeds widely available in most developed areas, though bandwidth is often shared with neighbors on the same local loop, which can mean slower performance at peak usage times. DSL uses existing telephone lines and is widely available but generally slower than cable or fiber, with speed dropping off the further a location is from the provider's central office.\n\nSatellite internet reaches locations no wired infrastructure can, making it valuable in rural or remote areas, but has historically suffered from high latency (the round-trip time to a satellite in orbit and back) and weather sensitivity — though modern low-orbit satellite services have significantly improved on older geostationary satellite performance. Cellular internet uses the mobile phone network and is convenient for portability, but is typically capped, more expensive per gigabyte, and more variable in real-world speed than a fixed wired connection."
      }
    ]
  },
  {
    "domain": "c1d3",
    "overview": "This is the domain most people picture when they think 'A+ certification' — the actual physical components inside a computer. Knowing what each part is called, how it connects, and what to check when specifying a replacement is the foundation everything else in hardware support builds on.",
    "sections": [
      {
        "heading": "Cables and connectors",
        "objectives": ["3.1"],
        "body": "Copper cabling covers everything from Ethernet network cable to internal power and data cables, and recognizing connector shapes on sight — which end plugs into what — is a core, practical skill. Fiber connectors carry light instead of electricity and come in several shapes (LC, SC, ST being common ones), used where long distance or immunity to electrical interference matters. Video connectors have evolved from older analog standards to today's digital standards (HDMI, DisplayPort), each with different maximum resolution and refresh-rate capabilities worth knowing when troubleshooting a display that won't run at its expected resolution.\n\nUSB has gone through multiple physical connector shapes (Type-A, Type-B, Type-C) and multiple speed generations that don't always correspond neatly to the connector shape — a USB-C connector doesn't guarantee USB4 speeds, the same way a Thunderbolt-capable port might look identical to a plain USB-C data port. Storage connectors — SATA for older/spinning and SATA SSD drives, the M.2 slot for compact NVMe drives — determine both what kind of drive physically fits and how fast it can actually perform."
      },
      {
        "heading": "RAM",
        "objectives": ["3.2"],
        "body": "DDR5 is the current generation of desktop/laptop memory, offering higher speeds and capacity than its predecessor DDR4 — and critically, DDR generations are not physically or electrically compatible with each other, so a motherboard built for one generation simply cannot use RAM from another. SODIMM is the smaller physical form factor used in laptops and small-form-factor systems, as opposed to the larger standard DIMM used in most desktops and servers.\n\nECC (Error-Correcting Code) memory can detect and correct small memory errors on its own, valued in servers and workstations where data integrity really matters, at a cost and compatibility tradeoff most consumer systems don't bother with. Running RAM in multiple channels (dual-channel, quad-channel) lets a system access more than one memory module simultaneously, meaningfully improving performance over running the same total capacity in a single channel — which is why matched-pair RAM kits, installed in the correct motherboard slots, are recommended over a single larger stick. Compatibility ultimately comes down to matching generation, speed, and the motherboard's supported specifications — mismatched RAM can fail to boot entirely or simply run at the speed of its slowest module."
      },
      {
        "heading": "Storage",
        "objectives": ["3.3"],
        "body": "An HDD (Hard Disk Drive) stores data on spinning magnetic platters — cheap per gigabyte and available in large capacities, but slow and mechanically vulnerable compared to solid-state options. A SATA SSD uses the same physical connector and interface as an HDD but has no moving parts, making it dramatically faster and more durable — a common, simple upgrade path for an older system. NVMe drives connect via the M.2 slot directly to the motherboard's high-speed PCIe lanes rather than through the older SATA interface, delivering far higher speeds than even a SATA SSD, which is why NVMe is now the standard for a modern high-performance build.\n\nRAID combines multiple physical drives to improve performance, redundancy, or both — RAID 0 stripes data for speed with zero redundancy (one drive failure loses everything), RAID 1 mirrors data for redundancy at the cost of usable capacity, and RAID 5/6 combine striping with parity data for a balance of performance and fault tolerance. Removable media — USB flash drives, external drives, memory cards — remains relevant for portable and backup storage even as cloud storage has taken over much of its old role."
      },
      {
        "heading": "Motherboards and CPUs",
        "objectives": ["3.4"],
        "body": "A CPU socket physically and electrically defines which processors a motherboard can accept — a CPU designed for one socket simply will not physically fit or work in a different one, making socket compatibility the very first check when planning any CPU upgrade. The chipset works alongside the CPU to manage communication between components, and different chipsets support different feature sets even within the same CPU socket family, which is why two motherboards with the same socket can still have meaningfully different capabilities.\n\nUEFI is the modern replacement for the legacy BIOS firmware that initializes hardware and starts the boot process, offering a graphical interface, mouse support, and support for larger drives than legacy BIOS ever could. TPM (Trusted Platform Module) is a dedicated security chip (or firmware equivalent) that securely stores encryption keys — required, notably, for Windows 11 and for full-disk encryption features like BitLocker to work as intended. Expansion slots (PCIe being the dominant standard today) let a motherboard's capability grow beyond its built-in components — the difference between PCIe generations and lane counts determines how much bandwidth a given slot can actually deliver to a card like a GPU or high-speed storage controller."
      },
      {
        "heading": "Power and cooling",
        "objectives": ["3.5"],
        "body": "A PSU (Power Supply Unit) converts wall AC power into the various DC voltages a computer's components actually need, and its wattage rating has to comfortably exceed the system's actual peak power draw — an undersized PSU causes instability, especially under load, that's easy to misdiagnose as some other component being faulty. The 80 PLUS certification rates a PSU's efficiency (how much power is delivered usefully versus wasted as heat) across several tiers — Bronze, Gold, Platinum, and so on — which affects both electricity cost and how much heat the PSU itself generates.\n\nCooling matters because every component that draws power also generates heat, and heat left unmanaged degrades performance and shortens component lifespan. Case and CPU fans move air to carry heat away; thermal compound (or thermal paste) fills the microscopic gaps between a CPU and its cooler, since even a seemingly flat, tightly-mounted heatsink would otherwise have significant air gaps that badly hurt heat transfer. A UPS (Uninterruptible Power Supply) sits between a wall outlet and critical equipment, providing battery backup that bridges a power outage and protects against power surges — for a desktop, that means enough runtime to save work and shut down cleanly rather than losing power abruptly."
      },
      {
        "heading": "Peripherals",
        "objectives": ["3.6"],
        "body": "Input devices (keyboards, mice, scanners, touchpads) and output devices (monitors, speakers, printers) round out how a user actually interacts with a system, and troubleshooting them often comes down to the same basic layers as everything else: is it physically connected, is the correct driver installed, is it recognized by the OS. Adapters convert one connector type to another (a common example: USB-C to HDMI) — genuinely useful, but every adapter is also one more physical connection point that can be the actual source of an intermittent problem, which is worth remembering before assuming a device itself is faulty.\n\nWebcams and scanners both convert a physical image into digital data, just for different purposes — a webcam for live video, a scanner for a static document — and both depend on drivers and, increasingly, specific application permissions (especially on modern OSes that gate camera and microphone access) to actually function, which is a common source of 'it's plugged in but doesn't work' tickets that have nothing to do with the hardware itself."
      },
      {
        "heading": "Printers",
        "objectives": ["3.7"],
        "body": "Laser printers work through a multi-step electrophotographic process: a laser charges a drum in the pattern of the image, toner (fine powder, not liquid ink) sticks to the charged areas, the toner is transferred to paper, and then fused permanently in place with heat — which is why a laser printout comes out warm and why a failing fuser assembly causes toner that smudges or rubs off. Inkjet printers spray liquid ink directly onto paper through tiny nozzles, generally cheaper to buy but with a higher long-term cost per page and print heads that can clog if left unused for a while.\n\nThermal printers use heat to darken specially-coated paper directly with no ink or toner at all — common for receipts, valued for having very few moving parts to fail, at the cost of print quality and paper that fades over time and shouldn't be relied on as permanent record. Impact printers physically strike an ink ribbon against paper, largely obsolete now except in specific niches like multi-part carbon-copy forms, where being able to produce several physical copies in a single pass still matters. Regular maintenance — cleaning, replacing consumables, calibration — differs meaningfully by printer type, which is exactly why the exam expects you to match a maintenance step to the correct printer technology, not apply the same fix universally."
      }
    ]
  },
  {
    "domain": "c1d4",
    "overview": "The smallest domain in Core 1, but an increasingly important one — most organizations now run at least some of their infrastructure in the cloud, and even a purely on-premises technician benefits from understanding the underlying concepts and the terminology cloud vendors use.",
    "sections": [
      {
        "heading": "Cloud models",
        "objectives": ["4.1"],
        "body": "The cloud service models describe how much of the technology stack the provider manages versus how much you manage yourself. IaaS (Infrastructure as a Service) gives you raw virtual machines, storage, and networking, and you manage the operating system and everything above it. PaaS (Platform as a Service) also manages the OS and runtime for you, so you just deploy application code. SaaS (Software as a Service) hands you a complete, ready-to-use application — you're just a user, managing none of the underlying infrastructure at all.\n\nThe deployment models describe who the cloud infrastructure is shared with. Public cloud is shared infrastructure available to any customer, generally the most cost-effective option. Private cloud is dedicated to a single organization, offering more control at higher cost, often chosen for compliance or security reasons. Hybrid cloud combines both, keeping some resources on-premises or private and some in a public cloud, connected together — usually a practical compromise driven by cost, latency, or regulatory requirements that make a full move to public cloud impractical."
      },
      {
        "heading": "Cloud characteristics",
        "objectives": ["4.2"],
        "body": "Elasticity is the ability for cloud resources to automatically scale up during high demand and back down when demand drops, so an organization pays for roughly what it's actually using rather than provisioning for peak load year-round. Metering means cloud usage is tracked and billed based on actual consumption — compute time, storage used, data transferred — rather than a flat fee, which is what makes elasticity financially meaningful in the first place.\n\nResource pooling means a cloud provider's physical infrastructure serves many customers simultaneously, with the underlying hardware abstracted away and dynamically assigned as needed — a core reason cloud computing can be so cost-efficient at scale. On-demand self-service lets a customer provision resources themselves, immediately, through a web console or API — without needing to call the provider or wait on a human. Multitenancy means multiple separate customers share the same underlying physical infrastructure while remaining logically isolated from each other — which makes the security boundaries between tenants a genuinely important design consideration for any cloud provider."
      },
      {
        "heading": "Client virtualization",
        "objectives": ["4.3"],
        "body": "A hypervisor is the software layer that creates and manages virtual machines. A Type 1 (bare-metal) hypervisor runs directly on hardware with no separate host OS underneath it, generally used for servers where performance and stability matter most. A Type 2 (hosted) hypervisor runs as an application on top of an existing OS — the more common choice for running a VM on a regular desktop or laptop, for testing or running a second operating system alongside the main one.\n\nA VM (Virtual Machine) is a complete, isolated virtual computer — its own virtual hardware, its own full OS — running on top of a hypervisor. A container is a lighter-weight alternative that packages an application with what it needs to run, but shares the host system's OS kernel rather than virtualizing an entire separate OS, which makes containers faster to start and less resource-hungry than a full VM, at the cost of being tied more closely to the host's OS type. A sandbox is an isolated environment (which might use VM or container technology under the hood) specifically for safely running untrusted or suspicious code without risking the real system. VDI (Virtual Desktop Infrastructure) hosts a full desktop environment centrally in a data center or cloud, streamed to a user's device — letting an organization centrally manage, secure, and update desktops that users access remotely from comparatively simple client devices."
      }
    ]
  },
  {
    "domain": "c1d5",
    "overview": "The single highest-weighted domain in Core 1. This is where every earlier hardware and networking chapter gets put to practical use — recognizing symptoms, narrowing down a root cause methodically, and knowing the specific, recurring failure patterns for each category of hardware.",
    "sections": [
      {
        "heading": "Motherboard, RAM, CPU, and power",
        "objectives": ["5.1"],
        "body": "POST (Power-On Self-Test) is the very first thing a system runs at startup, checking core hardware before the OS ever loads — a system that fails POST (often signaled by a specific pattern of beeps or diagnostic LEDs) is telling you the problem is fundamental hardware, not software, before you waste time troubleshooting anything else. A system with no power at all points toward the PSU, the power cable, or a dead motherboard, roughly in that order of how easy each is to check.\n\nOverheating causes a system to throttle performance or shut down unexpectedly to protect itself, and it traces back to the cooling chapter — failed fans, dried-out thermal paste, dust-clogged airflow. Unexplained performance problems or random shutdowns, once basic overheating is ruled out, often point to failing RAM or a struggling PSU that can't reliably deliver power under load — both of which tend to produce symptoms that look random and inconsistent rather than a single, repeatable failure, which is itself a useful diagnostic clue."
      },
      {
        "heading": "Storage and RAID",
        "objectives": ["5.2"],
        "body": "S.M.A.R.T. (Self-Monitoring, Analysis, and Reporting Technology) is a drive's own built-in health monitoring, capable of warning that a drive is failing before it actually fails completely — checking S.M.A.R.T. status is a genuinely proactive step, not just a reactive one, and worth doing on any system exhibiting odd storage-related symptoms even before an outright failure. A boot failure traces to several possible layers: the drive itself failing, corrupted boot files, or a misconfigured boot order in UEFI/BIOS pointing at the wrong device entirely — and figuring out which layer it's actually happening at is most of the diagnostic work.\n\nA degraded RAID array means one or more drives in the array have failed, and the array is running in a reduced, more vulnerable state (or has lost data entirely, depending on the RAID level and how many drives failed) — the priority in that state is replacing the failed drive and letting the array rebuild before a second failure causes real data loss. General read/write issues — slow performance, files that won't save properly, drives that intermittently disconnect — can stem from a failing drive, a loose or damaged cable connection, or in some cases outdated storage controller drivers, roughly in that order of likelihood."
      },
      {
        "heading": "Display and video",
        "objectives": ["5.3"],
        "body": "Artifacts — visual glitches, garbled colors, strange patterns on screen — typically point to a GPU problem, whether that's overheating, a driver issue, or genuine hardware failure. No image at all narrows down to a smaller set of usual suspects: the cable, the port, the GPU itself, or (on a laptop) the display panel or its connection to the motherboard — and swapping one variable at a time (a different cable, a different port, an external monitor) is the fastest way to isolate which one is actually at fault.\n\nA dim display can be a backlight that's failing, or on some laptops simply a brightness setting or power-saving mode a user didn't realize was active — worth checking before assuming hardware failure. Projector-specific issues often trace to a dirty or worn lamp/bulb, one of the most common projector maintenance items and often the most cost-effective single fix. Burn-in is permanent, faint ghosting of a static image left displayed too long, more of a concern on OLED panels than LCD ones given how OLED technology produces its image, and it's not something that can be repaired after the fact — only prevented."
      },
      {
        "heading": "Mobile devices",
        "objectives": ["5.4"],
        "body": "Battery issues on a mobile device commonly show up as unexpectedly short runtime, a battery that shows full charge but drains rapidly, or in more serious cases visible swelling — swelling in particular is a genuine safety hazard, not just a performance annoyance, and a swollen battery should be treated as needing immediate, careful handling and replacement, not ignored. Charging issues can stem from a damaged cable, a failing port, or (on a device with a removable battery) the battery itself no longer holding a charge properly — testing with a known-good cable and charger is the fastest way to isolate which.\n\nConnectivity issues (Wi-Fi, Bluetooth, or cellular that won't connect or drops frequently) can be software (needing a restart, a driver/firmware update, or a settings reset) or hardware (a failing antenna or wireless module) — software causes are far more common and much cheaper to try first. Touchscreen issues range from unresponsive areas to a screen registering phantom touches, and can stem from a damaged digitizer, a cracked screen putting physical pressure on the digitizer layer, or occasionally a screen protector interfering with touch sensitivity. Liquid damage is often not immediately fatal to a device, but corrosion continues to spread internally afterward if not properly cleaned — which is why professional cleaning soon after exposure meaningfully improves the odds of a full recovery compared to just letting the device dry out and hoping."
      },
      {
        "heading": "Printers",
        "objectives": ["5.5"],
        "body": "Fading print typically points to low toner or ink, though on a laser printer it can also mean a worn transfer roller no longer applying toner to the page evenly. Ghosting — a faint repeated image appearing elsewhere on the page — is a classic sign of a laser printer's drum not being fully cleaned or discharged between print cycles, leaving a residual image that shows up again slightly further down the page.\n\nPaper jams can stem from worn pickup rollers no longer feeding paper reliably, humidity affecting the paper itself, or a foreign object physically obstructing the paper path — and finding exactly where along the path the jam is occurring usually points straight at the cause. Lines running through a printout point toward a scratched drum (laser) or a partially clogged print head nozzle (inkjet) — the exact same visible symptom, two completely different underlying mechanisms depending on which printer technology produced it. Queue problems — jobs stuck, printing failing to start, or printing to the wrong device — are very often a software/driver/spooler issue rather than anything physically wrong with the printer at all, which makes them worth ruling out early before pulling the printer apart."
      },
      {
        "heading": "Networks",
        "objectives": ["5.6"],
        "body": "Seeing an APIPA address (169.254.x.x) on a device is one of the single most useful diagnostic clues in networking — it means the device couldn't reach a DHCP server and fell back to self-assigning an address, which immediately tells you to look at DHCP or basic connectivity rather than anything more exotic. DNS problems typically look like 'the internet is down' to a user even though the underlying connection works fine — sites won't load by name, but the same site often works fine if you connect directly by IP address, which is a fast, telling way to confirm DNS specifically is the culprit.\n\nA misconfigured or unreachable gateway means a device can talk to other devices on its own local network but can't reach anything beyond it, including the internet — a very specific and recognizable symptom pattern distinct from a total connectivity failure. Wireless interference (from other networks, physical obstructions, or non-Wi-Fi devices like some cordless phones and microwaves operating on overlapping frequencies) causes intermittent, hard-to-pin-down slowness or drops rather than a clean, total failure. Physical cabling problems — a damaged cable, a bad connector, a port that's come loose — remain one of the most common and most overlooked causes of network trouble precisely because it's easy to assume a problem is 'in the software' and skip checking the simplest physical layer first."
      }
    ]
  },
  {
    "domain": "c2d1",
    "overview": "Operating systems are the software layer every piece of hardware from Core 1 ultimately serves. This domain covers the Windows environment in real depth — since it's still the dominant OS a technician will support — plus enough macOS and Linux to competently support those too.",
    "sections": [
      {
        "heading": "Windows editions",
        "objectives": ["1.1"],
        "body": "Windows 10 and Windows 11 remain in active use side by side in many organizations, and each comes in several editions with meaningfully different capabilities. Home edition is aimed at individual consumers and lacks several features businesses rely on. Pro edition adds those business-relevant features — BitLocker encryption, joining an Active Directory or Azure AD domain, Remote Desktop hosting, and Group Policy support. Enterprise edition builds further on Pro, adding advanced deployment, management, and security features aimed specifically at large organizations with dedicated IT departments.\n\nKnowing which edition a given machine is running matters practically, not just as trivia — a technician asked to enable BitLocker or join a domain on a Home-edition machine needs to recognize immediately that the edition itself is the blocker, not a misconfiguration, and that an edition upgrade (not a settings change) is what's actually required."
      },
      {
        "heading": "Windows tools",
        "objectives": ["1.2"],
        "body": "Task Manager is the fastest way to see what's currently running, how much CPU/memory/disk each process is consuming, and to forcibly end an unresponsive application — usually the first tool reached for when a system feels sluggish or something has visibly frozen. MMC (Microsoft Management Console) is a framework that hosts administrative tools called snap-ins — Device Manager and Disk Management are both technically MMC snap-ins, even though they're commonly opened directly rather than through MMC itself.\n\nEvent Viewer logs system, security, and application events, and is often the very first place to check when troubleshooting a problem that isn't obviously visible on screen — a crash, an unexpected reboot, a failed service — since the relevant error is frequently already logged there in detail. The Registry is the central hierarchical database storing low-level configuration for Windows and installed applications — powerful to edit directly, but also risky, since an incorrect registry edit can genuinely break a system in ways that are hard to undo, which is why registry edits are typically a last resort after the standard, safer settings UI options have been exhausted. Disk Management handles partitioning, formatting, and drive letter assignment — the graphical counterpart to several of the command-line disk tools covered next."
      },
      {
        "heading": "Windows command line",
        "objectives": ["1.3"],
        "body": "Command-line tools remain essential specifically because they work in situations the graphical interface can't reach — over a bare remote session, in a scripted/automated task, or when a system is broken badly enough that the normal desktop won't even load. Networking commands like ipconfig (view/release/renew IP configuration) and ping (test basic reachability) are usually the fastest way to diagnose a connectivity problem, faster than opening any graphical network settings panel.\n\nFilesystem commands handle navigating and manipulating files and directories directly. Repair-oriented commands like sfc (System File Checker, which scans for and repairs corrupted system files) and chkdsk (checks a drive for filesystem errors and bad sectors) are frequently the fix for problems that look mysterious through the graphical interface but trace back to actual file or disk corruption underneath. gpupdate manually forces a refresh of Group Policy settings on a domain-joined machine rather than waiting for the normal automatic refresh interval. File operation commands (copy, move, delete, and their variants) let a technician manipulate files directly and precisely — genuinely useful in scripted repair or deployment scenarios where doing the same thing by hand for many machines simply isn't practical."
      },
      {
        "heading": "Windows settings",
        "objectives": ["1.4"],
        "body": "Modern Windows configuration is split (somewhat inconsistently) between the newer Settings app and the older Control Panel, and a competent technician needs to be comfortable navigating both, since not every setting has fully migrated to the newer interface yet. Account settings manage local and Microsoft/organizational sign-in, along with settings like PIN and biometric login. Networking settings configure Wi-Fi, Ethernet, and VPN connections.\n\nApp settings control what's installed, default applications for specific file types, and per-app permissions. Privacy settings control what data and hardware (camera, microphone, location) individual apps are allowed to access — increasingly relevant as more apps request access to more device capabilities by default. Windows Update settings control how and when the OS receives security and feature updates — and understanding the different update channels and pause/defer options matters in a business context, where updates are often deliberately staged and tested rather than applied the instant they're released, to avoid an untested update breaking business-critical software."
      },
      {
        "heading": "Windows installation",
        "objectives": ["1.5"],
        "body": "A clean install puts a fresh copy of Windows onto a drive with nothing preserved from before, giving the most reliable, problem-free starting point at the cost of needing to reinstall applications and restore data afterward. An in-place upgrade installs a newer version of Windows over an existing one while preserving apps, settings, and files — more convenient, but with more potential for existing problems or incompatible software to carry forward into the new installation.\n\nPartitioning divides a drive's space, whether into a single partition for the whole drive or multiple partitions for different purposes (a small recovery partition, a main OS partition). Drivers — software that lets the OS communicate with specific hardware — are essential immediately after installation, and a fresh install missing network or storage drivers can genuinely be unable to complete setup or reach the internet on its own, a fairly common real-world snag. Recovery options include Windows' built-in reset function (which can preserve or remove personal files depending on the option chosen) and restoring from a full system backup image — both worth understanding as fallback options when troubleshooting hasn't resolved a serious problem and a fresh start becomes the more practical path forward."
      },
      {
        "heading": "macOS and Linux",
        "objectives": ["1.6"],
        "body": "macOS ships with its own set of built-in utilities: Disk Utility manages partitioning and drive health, Time Machine handles automatic, versioned backups, and Migration Assistant transfers data and settings from an old Mac (or a Windows PC) to a new one. Common macOS keyboard-driven and Terminal commands overlap conceptually with their Windows and Linux counterparts, even though the exact syntax differs.\n\nLinux is genuinely more command-line-centric in typical day-to-day administration than either Windows or macOS, and a technician is expected to know a set of foundational commands: ls (list directory contents), cd (change directory), and others for navigating and managing the filesystem directly rather than through a graphical file manager. Linux permissions work through a read/write/execute model applied separately to a file's owner, group, and everyone else — a genuinely different mental model from Windows' more graphical, ACL-based permission system, and one the exam specifically tests understanding of. Both OSes support backups and running applications, but with philosophies and default tools different enough from Windows that a technician who only knows Windows well can still be caught off guard by basic macOS or Linux support requests without at least this foundational familiarity."
      },
      {
        "heading": "More Windows tools",
        "objectives": [
          "1.2"
        ],
        "body": "Beyond Task Manager and Event Viewer, a handful of consoles show up constantly in support work. Device Manager (devmgmt.msc) lists every device and its driver — a yellow warning icon marks a problem, and the driver tab offers Update, Roll Back, Disable, and Uninstall. Task Scheduler runs programs on a schedule or trigger, Services (services.msc) controls whether and when each background service starts, and Local Users and Groups and Certificate Manager handle local accounts and certificates (the first is missing on Home edition).\n\nFor diagnostics, Performance Monitor logs counters over time to build a baseline, Resource Monitor shows live per-process detail down to files and ports, and System Information (msinfo32) is a read-only inventory including BIOS mode and Secure Boot state. System Configuration (msconfig) is the one that changes boot behavior — Safe boot and the clean-boot technique of hiding Microsoft services and disabling the rest to isolate a conflict. Disk Cleanup frees space by deleting junk, Optimize Drives defragments hard disks but only trims SSDs, and Disk Management can shrink and extend volumes without erasing them."
      },
      {
        "heading": "More command-line tools",
        "objectives": [
          "1.3"
        ],
        "body": "DNS and path problems have their own commands. nslookup tests name resolution, so it explains why pinging a name fails while pinging the IP works, and tracert lists each hop on the path and where it slows or stops. net use maps drive letters to UNC shares such as \\\\server\\share, net user creates, disables, and resets accounts, and gpresult reports which Group Policy settings actually applied (gpupdate /force is what refreshes them).\n\nformat writes a new file system and erases the volume, tasklist and taskkill find and end processes by name or PID, and DISM repairs the Windows component store that sfc depends on — when sfc /scannow cannot fix corruption, run DISM /Online /Cleanup-Image /RestoreHealth and then sfc again. Adding /? to almost any command prints its syntax and switches, and winver shows the edition and build number in a small dialog."
      },
      {
        "heading": "Windows Settings, installation, and upgrades",
        "objectives": [
          "1.4",
          "1.5"
        ],
        "body": "The Settings app groups options by page: System (display, power, storage, About), Time & language (the clock matters — a drifting time breaks Kerberos and certificate checks), Accessibility (Magnifier, Narrator, Sticky Keys), and Network & Internet, where Network reset reinstalls every adapter as a last step for stubborn connectivity problems.\n\nFor installation, firmware settings and disk layout matter: GPT is needed for disks over 2 TB and for UEFI boot, while MBR tops out at 2 TB and four primary partitions. PXE lets many PCs install over the network, and an answer file (autounattend.xml) makes setup unattended. Reset this PC reinstalls Windows and lets you keep personal files. Windows 11 requires UEFI with Secure Boot and TPM 2.0, which is why capable-looking older PCs sometimes cannot upgrade — so back up, check compatibility, and test before any upgrade."
      },
      {
        "heading": "Windows networking",
        "objectives": [
          "1.7"
        ],
        "body": "A workgroup is peer-to-peer: each PC keeps its own accounts, which is fine for a handful of machines. A domain centralizes accounts and Group Policy on a domain controller, and joining one needs Windows Pro or higher plus working DNS. Mapped drives give a shared folder a drive letter, a metered connection tells Windows to defer big downloads, and a firewall exception opens one program or port through Windows Defender Firewall without turning it off.\n\nRemote connectivity relies on two different tools that are easy to confuse: a VPN builds an encrypted tunnel into the private network, while a proxy simply relays web requests for filtering or caching. On the IP side, a static address is typed into the adapter's IPv4 properties, whereas a 169.254.x.x address means DHCP failed and the PC addressed itself — it can talk only to other local devices."
      },
      {
        "heading": "Control Panel utilities",
        "objectives": [
          "1.8"
        ],
        "body": "The classic Control Panel still hosts many support tools. Internet Options covers security zones, proxy, and privacy for web access; Programs and Features (appwiz.cpl) uninstalls programs and toggles Windows features such as Hyper-V; Power Options sets power plans, lid and button actions, sleep, hibernate, and Fast Startup; and Credential Manager holds saved passwords, where a stale entry is a common cause of repeated account lockouts.\n\nFile Explorer Options reveals hidden files and file extensions — worth turning on to spot disguised names like invoice.pdf.exe. Devices and Printers handles default printers and print queues, Indexing Options rebuilds Windows Search, Network and Sharing Center holds adapter and advanced sharing settings, and the Mail applet manages Outlook profiles and data files."
      },
      {
        "heading": "Applications and cloud productivity",
        "objectives": [
          "1.9",
          "1.10"
        ],
        "body": "Before installing anything, compare the application's system requirements with the machine — operating system and 32/64-bit support, CPU, RAM, storage, and graphics. For many machines, use centralized deployment (Intune, Configuration Manager, or Group Policy) so installs are silent and consistent, and start with a pilot group so compatibility or network problems appear before everyone is affected. Compatibility mode can coax a legacy program into running by emulating an older Windows version.\n\nCloud productivity suites such as Microsoft 365 and Google Workspace deliver email, calendars, documents, and storage as hosted services, usually tied to single sign-on so one verified login works across many apps. Version history in cloud storage restores an earlier copy of a file after an accidental overwrite — different from the Recycle Bin, which only holds deleted files."
      },
      {
        "heading": "OS types and file systems",
        "objectives": [
          "1.11"
        ],
        "body": "Operating systems are built for different roles: workstation systems serve one interactive user, server systems host services such as AD, DNS, DHCP, and file and print for many, embedded systems run one fixed function inside a device (and are often hard to patch), and ChromeOS is a browser-centric cloud OS. An end-of-life OS no longer receives security patches, so it is a growing risk even if it still runs.\n\nFile systems follow the platform: NTFS is the Windows standard, with permissions, encryption, and huge files; FAT32 is universally readable but caps files at 4 GB; exFAT removes that limit and works on both Windows and macOS, which makes it the usual choice for flash drives; APFS is the modern macOS default; and ext4 is the common Linux default."
      },
      {
        "heading": "macOS features",
        "objectives": [
          "1.12"
        ],
        "body": "Finder is the file manager and Spotlight (Command+Space) is the system-wide search. Mission Control shows all open windows and Spaces, and Force Quit (Option+Command+Esc) ends a frozen app, while Activity Monitor is the Mac's Task Manager with live per-process use.\n\nSecurity and sync features have Windows counterparts worth knowing: Keychain stores passwords and certificates (like Credential Manager), FileVault encrypts the startup disk (like BitLocker), and Gatekeeper checks that downloaded apps are signed and notarized before they run. iCloud syncs files, photos, backups, and passwords across Apple devices, while Time Machine remains the local backup."
      },
      {
        "heading": "Linux commands and tools",
        "objectives": [
          "1.13"
        ],
        "body": "Everyday Linux administration is command-line work. grep searches the contents of text, find locates files by name or age, ps and top show processes (with kill to end one), df and du report disk space per file system and per directory, and ip addr shows network addresses much as ipconfig does on Windows. man displays the manual page for any command, and nano or vi edit files inside a terminal.\n\ncron runs scheduled jobs from crontab entries, dd copies raw blocks (and erases whichever target you name), and Samba lets a Linux server share files with Windows over SMB. Linux uses a single directory tree: /etc holds configuration, /home user files, and /var/log the logs."
      }
    ]
  },
  {
    "domain": "c2d2",
    "overview": "This is A+'s security domain — narrower and more workstation-focused than the dedicated Security+ certification, but covering the practical controls, threats, and data-protection habits every technician is expected to apply on the systems they directly support.",
    "sections": [
      {
        "heading": "Security controls",
        "objectives": ["2.1"],
        "body": "Physical controls protect systems through tangible means — locked doors, cable locks, secured server rooms. Logical (technical) controls use software and configuration — permissions, encryption, firewalls. Administrative controls are policies and procedures — a password policy, a security awareness training requirement — that shape how people are expected to behave rather than technically enforcing anything directly.\n\nLeast privilege means giving a user only the access actually needed for their role, nothing more — which limits the damage if that specific account is ever compromised. Zero Trust extends that same instinct to the network as a whole: nothing is automatically trusted just because it's inside the perimeter; every request gets verified regardless of where it originates. These aren't abstract concepts on the exam — expect scenario questions describing a specific situation and asking which category of control, or which principle, is actually being applied or is actually needed."
      },
      {
        "heading": "Threats and attacks",
        "objectives": ["2.2"],
        "body": "Social engineering manipulates people rather than exploiting a technical flaw — phishing (deceptive email), vishing (voice/phone-based), and shoulder surfing (literally watching someone enter a password) are all common forms a technician needs to recognize and be able to explain to end users, since users are usually the actual target, not the IT systems themselves. Malware covers a wide range of malicious software — viruses that attach to and spread via other files, worms that self-replicate across a network without any user action needed, ransomware that encrypts files and demands payment, and spyware that secretly monitors activity — and recognizing which symptoms point toward which malware category speeds up both containment and cleanup.\n\nWireless attacks specifically target Wi-Fi networks — from cracking weak encryption to setting up a rogue access point that mimics a legitimate network to trick users into connecting to it. Password attacks range from simple guessing to brute-force attempts (systematically trying combinations) to credential stuffing (reusing credentials leaked from an unrelated breach) — which is exactly why password reuse across multiple accounts is such a persistent, practical risk worth actively discouraging with users."
      },
      {
        "heading": "Workstation security",
        "objectives": ["2.3"],
        "body": "Hardening a workstation means reducing its attack surface — disabling unused features and accounts, removing unnecessary software, closing unneeded ports — the same underlying principle covered back in the hardware/networking chapters, now applied specifically at the OS and application level. Encryption (BitLocker being the standard built-in Windows option) protects data at rest, so if a drive is physically removed or a laptop is stolen, the data on it remains unreadable without the correct key.\n\nSecure Boot verifies that only trusted, digitally-signed software loads during the boot process, blocking a category of malware (bootkits) that tries to load before the OS — and before most security software — even has a chance to run. Keeping a system current with security updates closes known vulnerabilities before they can be exploited, which is exactly why patch management remains one of the single highest-value, most basic security practices there is, on both servers and everyday workstations. EDR (Endpoint Detection and Response) monitors a workstation continuously for suspicious behavior and can respond automatically, going meaningfully beyond what traditional antivirus alone catches on its own."
      },
      {
        "heading": "Mobile security",
        "objectives": ["2.4"],
        "body": "MDM (Mobile Device Management) lets an organization enforce security policy on mobile devices remotely — requiring encryption and screen locks, controlling which apps can be installed, and enabling remote wipe. BYOD (Bring Your Own Device) policy governs how personally-owned devices are allowed to access organizational resources, balancing user convenience and privacy against the organization's genuine need to secure its own data.\n\nRemote wipe erases a device's data remotely, most commonly used when a device is lost or stolen and the risk of the data falling into the wrong hands outweighs the loss of the device itself. App control restricts which applications can be installed or run on a managed device, limiting exposure to malicious or simply unauthorized software. Screen locks — PIN, password, pattern, or biometric — are the most basic and most important mobile security control there is, since nearly every other protection on a device assumes the attacker doesn't already have unlocked, unrestricted physical access to it."
      },
      {
        "heading": "Data protection",
        "objectives": ["2.5"],
        "body": "PII (Personally Identifiable Information) is any data that can identify a specific individual — names, Social Security numbers, addresses — and it carries real legal and regulatory weight in how it must be handled and protected, not just general best-practice weight. DLP (Data Loss Prevention) tools monitor and block sensitive data from leaving an organization's control, whether through email, USB, or upload, based on defined policy.\n\nBackups protect against data loss from hardware failure, accidental deletion, or ransomware — and different backup types trade completeness against speed and storage space: a full backup, an incremental backup (only what changed since the last backup of any kind), and a differential backup (everything changed since the last full backup). Destruction ensures data is truly unrecoverable when a device or storage medium is retired — simple deletion or even reformatting is not sufficient for genuinely sensitive data, since the underlying data commonly remains recoverable with the right tools until it's actually overwritten or physically destroyed. Permissions control who can access specific files and folders, forming the basic, everyday access-control layer nearly all of the above ultimately depends on to actually be effective in practice."
      },
      {
        "heading": "Malware removal",
        "objectives": ["2.6"],
        "body": "CompTIA defines a specific, ordered process for malware remediation, and the exam tests the order directly, not just the individual steps. First, identify and research the malware symptoms to understand what's actually being dealt with. Quarantine the infected system — disconnect it from the network — so the infection can't spread further while it's being cleaned up.\n\nDisable System Restore (on Windows) before remediation, since malware can otherwise hide inside a restore point and simply reappear later even after an apparently successful cleanup. Remediate the infected system, using appropriate anti-malware tools to actually remove the threat. Schedule scans and run updates afterward, to catch anything that was missed on the first pass and ensure defenses are current going forward. Enable System Restore again once the system is confirmed clean. Finally, educate the end user on what happened and how to avoid it recurring — since in most real cases, some user action (however unintentional) played a role in the infection happening in the first place, and that's the step that actually prevents a repeat."
      },
      {
        "heading": "Physical and logical security controls",
        "objectives": [
          "2.1"
        ],
        "body": "Physical controls keep people and vehicles away from equipment: bollards stop vehicles, an access control vestibule (mantrap) admits one authenticated person at a time to defeat tailgating, badge readers and smart cards check something you have, biometrics check something you are, and surveillance cameras record while motion sensors and alarms alert in real time. Know which control prevents, detects, or records, since scenarios often hinge on that difference.\n\nOn the logical side, an access control list states who may do what to a resource, and email filtering screens mail before users see it. In a Windows domain, domain controllers authenticate users and computers, organizational units group them so Group Policy can be applied separately, security groups carry permissions (grant to the group, then manage membership), logon scripts map drives and printers at sign-in, and folder redirection stores Documents and Desktop on a server."
      },
      {
        "heading": "Workstation hardening practices",
        "objectives": [
          "2.3"
        ],
        "body": "Several simple settings cover most day-to-day workstation risk. A strong password policy emphasizes length and uniqueness over clever substitutions, account lockout blocks rapid guessing after repeated failures, and a screen lock timeout protects an unattended session. Logon-hour and workstation restrictions limit when and where an account works, and disabling or renaming the default Administrator and Guest accounts removes well-known targets.\n\nDisable AutoRun and AutoPlay so a program on a USB drive cannot launch by itself, and set a BIOS or UEFI password so nobody can change the boot order to start from their own media. Each control addresses a different step of an attack, so match the control to the threat — a Windows password does nothing for firmware settings, for example."
      },
      {
        "heading": "Mobile and IoT protection",
        "objectives": [
          "2.4"
        ],
        "body": "A locator app finds, rings, and locks a lost phone, with remote wipe as the destructive last resort. Sideloading installs apps from outside the official store and skips vetting, while jailbreaking or rooting removes the operating system's own restrictions; MDM typically flags both as non-compliant.\n\nIoT and embedded devices are rarely patched and cannot run endpoint security, so harden them by changing default credentials, updating firmware, disabling unneeded services, and isolating them on a separate network."
      },
      {
        "heading": "Data destruction and disposal",
        "objectives": [
          "2.5"
        ],
        "body": "Deleting files or running a standard format only rebuilds the index and leaves the data recoverable. To reuse a drive, overwrite every sector with a drive wipe; to retire it, degauss magnetic media (which does nothing to SSDs) or physically destroy it by shredding, drilling, crushing, or incinerating. Physical destruction is the most certain option for failed or highly sensitive media.\n\nWhen a vendor performs the work, a certificate of destruction lists the serial numbers, date, and method as proof for auditors. This is different from chain of custody, which documents how evidence was handled."
      },
      {
        "heading": "Wireless security and authentication",
        "objectives": [
          "2.7"
        ],
        "body": "WEP and WPA with TKIP are RC4-based and weak; WPA2 with AES-CCMP is the long-standing solid choice, and WPA3 adds SAE, a handshake that resists offline guessing of a captured passphrase. Personal mode shares one passphrase, while Enterprise mode uses 802.1X so each user or device authenticates individually to a RADIUS server.\n\nKnow which protocol serves which job: TACACS+ authorizes administrators on network devices command by command (TCP 49), RADIUS handles user network access (UDP 1812/1813), and Kerberos issues time-limited tickets in Active Directory and therefore depends on synchronized clocks. For second factors, authenticator apps beat SMS codes, and hardware security keys are the strongest option against phishing."
      },
      {
        "heading": "Malware types and prevention",
        "objectives": [
          "2.8"
        ],
        "body": "A trojan is disguised as useful software and needs the user to run it; a virus attaches to a host file and needs user action to spread; a worm replicates itself across networks through vulnerabilities. Spyware watches and reports, a keylogger records keystrokes, a cryptominer steals processor cycles (constant 100% CPU at idle is the clue), a boot sector virus loads before the OS, and a botnet is a group of infected machines controlled remotely.\n\nDefenses combine technology and people: signature detection catches known samples, heuristic and behavioral detection catches new variants, and security awareness training reduces the number of convincing phishing emails that get clicked."
      },
      {
        "heading": "Social engineering, attacks, and vulnerabilities",
        "objectives": [
          "2.9"
        ],
        "body": "Phishing has many delivery channels: vishing by voice, smishing by text, QR-code phishing hidden in an image, spear phishing aimed at a person or group, and whaling aimed at executives. Impersonation and dumpster diving need no technology at all, and business email compromise tricks staff into payments by impersonating a trusted sender.\n\nOn the technical side, DoS and DDoS attacks target availability, on-path attacks sit between two parties, a dictionary attack tries a word list while brute force tries every combination, SQL injection targets the database and XSS targets other users' browsers. A zero-day has no patch yet, while an unpatched or end-of-life system is a known flaw left open, and insider and supply chain threats come through trusted access."
      },
      {
        "heading": "Windows security settings",
        "objectives": [
          "2.10"
        ],
        "body": "User Account Control prompts before elevated actions, and everyday work belongs in a standard account while administrator accounts are used only when needed (run as administrator elevates one task). Windows Hello signs in with a device-bound PIN or biometric, and Microsoft Defender Antivirus provides built-in real-time malware protection in the Windows Security app.\n\nNTFS permissions are inherited from the parent: copying takes the destination's permissions, and a same-volume move keeps the original ones. When share and NTFS permissions both apply, the most restrictive result wins. For encryption, BitLocker covers whole volumes, BitLocker To Go covers removable drives, and EFS encrypts individual files tied to a user certificate."
      },
      {
        "heading": "SOHO network security",
        "objectives": [
          "2.11"
        ],
        "body": "Start a new router by changing its default administrator credentials and network name, installing firmware updates, and using WPA2 or WPA3. MAC filtering and hiding the SSID are speed bumps rather than real protection, and port forwarding and UPnP open paths in from the Internet, so keep them deliberate or off.\n\nA DHCP reservation gives a device the same address from the server, content filtering blocks websites by category, a guest network keeps visitors away from internal devices, and a screened subnet (DMZ) isolates public servers from the internal LAN."
      },
      {
        "heading": "Browser security",
        "objectives": [
          "2.12"
        ],
        "body": "Download software only from official sources and verify the published hash. Keep extensions to a minimum because they run with page access, use a password manager (it will not autofill on a look-alike domain), and block pop-ups and ads to cut down on fake alerts and malvertising.\n\nHTTPS means the traffic is encrypted and the certificate verifies the domain, but it does not prove the site is trustworthy. Private browsing only forgets local history, and clearing cache and cookies is a quick first fix for one site that misbehaves."
      }
    ]
  },
  {
    "domain": "c2d3",
    "overview": "This domain is where hardware, OS, and security knowledge from every earlier chapter come together in the form of realistic troubleshooting scenarios — a system, an application, a mobile device, or a cloud service that isn't behaving the way it should.",
    "sections": [
      {
        "heading": "Windows OS issues",
        "objectives": ["3.1"],
        "body": "Boot problems can trace to corrupted boot files, a failing drive, or incorrect boot order in UEFI/BIOS — and Windows' built-in recovery environment (accessible even when the normal OS won't load) provides tools specifically for diagnosing and repairing exactly these kinds of startup failures without needing a full reinstall. Performance problems — a system that's become sluggish over time — very often trace to too many programs launching automatically at startup, a nearly-full drive with little free space left for the OS to work with, or malware quietly consuming resources in the background.\n\nApplication problems range from a program that won't launch at all to one that crashes intermittently, and the cause frequently comes down to corrupted installation files, missing dependencies, or an outright incompatibility with the installed OS version. A service that's failed to start (or crashed) can quietly break functionality that isn't obviously connected to that service at all from a user's point of view, which is exactly why Event Viewer and the Services console are common early stops when troubleshooting a problem that doesn't have an obvious cause. Profile problems — a corrupted user profile in particular — can cause a huge range of strange, seemingly unrelated symptoms concentrated around one specific user account, while every other account on the very same machine continues working completely normally."
      },
      {
        "heading": "PC security issues",
        "objectives": ["3.2"],
        "body": "Unexpected pop-ups, especially ones appearing outside a browser or claiming things like 'your computer is infected, call this number immediately,' are a strong sign of adware or an outright scam, not a genuine system warning — genuine OS security alerts essentially never ask you to call a phone number. Browser redirects, where searches or typed URLs land somewhere unexpected, typically point to a browser hijacker or a malicious extension quietly altering browser behavior in the background.\n\nCertificate warnings mean a site's identity can't be properly verified, and while they can sometimes be a false positive from something as simple as an expired certificate, they can also be a genuine on-path attack in progress — which is exactly why they should never be dismissed reflexively without at least a moment's thought about why the warning is actually appearing. Unauthorized access — signs someone else has been using an account or system — might show up as unfamiliar files, unexpected settings changes, or login activity a user doesn't recognize as their own, and it warrants an immediate password change and a genuine investigation into how the access happened in the first place, not just addressing the immediate symptom."
      },
      {
        "heading": "Mobile OS and apps",
        "objectives": ["3.3"],
        "body": "App crashes can stem from a bug in the app itself, an outright incompatibility with the current OS version, or simply insufficient device storage or memory to run properly. Battery drain complaints, beyond simple aging (which affects every battery over time regardless of use pattern), often trace to one specific app running excessively in the background, or a stuck process that never properly releases the resources it grabbed.\n\nStorage issues — a device that's nearly full — degrade overall performance noticeably beyond just blocking new downloads, since many operating systems need some genuinely free space to operate efficiently even for basic, everyday tasks. Connectivity problems (Wi-Fi, Bluetooth, cellular) generally start with the same basic checks as any other device: is the specific feature actually enabled, is airplane mode off, has a simple restart been tried yet — cheap, fast checks before assuming anything more serious is actually wrong. Update problems can stem from insufficient storage space to even complete the download, an unstable network connection interrupting the process partway through, or in rarer cases an incompatibility that genuinely blocks a specific device from moving to a newer OS version at all."
      },
      {
        "heading": "Application and cloud issues",
        "objectives": ["3.4"],
        "body": "Licensing issues can prevent an application from launching entirely or lock a user out of specific features, and they're worth checking early since the underlying fix (renewing or correctly activating a license) is often trivially simple once actually identified — but very easy to overlook while chasing a more complicated technical explanation instead. Sync issues mean data isn't properly updating across a user's devices or with a cloud service, commonly caused by connectivity problems, a full storage quota, or a genuine conflict between two devices that both modified the exact same file while offline.\n\nPermissions issues block a user from accessing something they should reasonably be able to, or conversely — a genuine security concern — grant access to something they shouldn't be able to reach at all; both directions are worth checking, not just the direction the user happens to be complaining about in the moment. Compatibility issues arise when software depends on a specific OS version, specific hardware capability, or another specific piece of software that isn't present or is a mismatched version. Availability issues mean a cloud service simply can't be reached — which could be a genuine, widespread provider-side outage, or could just as easily be a local network or DNS problem masquerading as one, and distinguishing between the two (checking a provider's public status page is usually the fastest way) determines whether the fix is on your end at all or simply a matter of waiting."
      },
      {
        "heading": "More Windows problems and recovery tools",
        "objectives": [
          "3.1"
        ],
        "body": "Match the symptom to the layer. A black screen with a pointer means Windows is running, so restart explorer.exe from Task Manager or check the display driver; \"Operating system not found\" is a boot-record problem fixed from the recovery environment with bootrec; a low memory warning means RAM and the page file are exhausted; and a USB controller resource warning means too many devices share one controller.\n\nWrong or drifting time (often a dead CMOS battery) breaks certificates and Kerberos sign-in, limited connectivity with a 169.254 address means DHCP failed, and a slow profile load usually comes from a large roaming profile. Safe Mode loads minimal drivers to isolate problems, and System Restore rolls system state back to a restore point without touching documents."
      },
      {
        "heading": "More PC security symptoms",
        "objectives": [
          "3.2"
        ],
        "body": "Malware often attacks defenses first, so antivirus that turns itself off or cannot update is a symptom of infection, and failing Windows Updates may come from corrupted components, a wrong clock, or interference (use the troubleshooter, then DISM and sfc). The hosts file overrides DNS for one PC, so a single machine reaching a fake site while others reach the real one points to tampering.\n\nIf contacts receive spam from a user and the sent items show messages the user never wrote, the mailbox is compromised: reset the password, enable MFA, sign out all sessions, and remove forwarding rules and delegates."
      },
      {
        "heading": "Mobile reboots, rotation, and reset",
        "objectives": [
          "3.3"
        ],
        "body": "Random reboots point to a recent app or update, overheating, or a failing battery. A screen that will not rotate is almost always the rotation lock or an app that does not support landscape. A factory reset erases everything, so it comes last and only after a backup."
      },
      {
        "heading": "Mobile security issues",
        "objectives": [
          "3.5"
        ],
        "body": "Ads and \"virus detected\" warnings outside any app point to adware or an abused notification permission. Spoofed apps imitate real ones, so check the publisher and install only from official stores, and permissions that do not fit an app's purpose are a red flag to review and revoke.\n\nDeveloper mode and USB debugging give a connected computer deep control, so keep them off when not developing. If personal data leaks, secure the accounts (new passwords and MFA) and review the apps and permissions behind it."
      },
      {
        "heading": "Boot repair, printing, and performance triage",
        "objectives": [
          "3.1"
        ],
        "body": "When Windows will not start, work through the recovery environment in order: Startup Repair for damaged boot files, then uninstall the latest update, System Restore, and command-line repair (bootrec, offline sfc). The INACCESSIBLE_BOOT_DEVICE stop code often follows a SATA mode change (AHCI or RAID) in firmware, so revert that setting first.\n\nFor a slow or unstable PC, sort Task Manager by the busy column to find the process behind high CPU, memory, or disk use, and use Reliability Monitor (perfmon /rel) to see when crashes and failed updates began. A stuck print queue is fixed by stopping the Print Spooler, clearing its spool folder, and starting it again — no new hardware needed."
      },
      {
        "heading": "Compromise indicators on a PC",
        "objectives": [
          "3.2"
        ],
        "body": "Several symptoms point to compromise even when no alert appears: files renamed or permissions changed with no ticket, constant unexplained outbound traffic (check destinations with netstat), repeated lockouts or password-reset emails nobody requested, and unwanted toolbars that came bundled with a free installer (a potentially unwanted program).\n\nRespond in order: isolate the machine, look at logs, remove or reset the cause, and restore from a clean backup if files were changed. Add MFA where credentials were being tested."
      },
      {
        "heading": "Mobile performance, installs, and heat",
        "objectives": [
          "3.3",
          "3.5"
        ],
        "body": "A sluggish phone is usually low storage, background apps, an old OS, or a worn battery, so free space, restart, and update before a reset. Failed installs or updates come from low storage, an old OS, or a store account or cache problem, not only from the network.\n\nA hot device with a bulging battery is a safety hazard: stop using and charging it and replace the battery. Apps that open on their own, unknown apps, or messages the owner never sent suggest malware, so review recent installs and permissions, scan, and reset if the behavior returns."
      }
    ]
  },
  {
    "domain": "c2d4",
    "overview": "The final domain steps back from any single piece of technology and covers the professional practices that make IT support actually function reliably at scale — documentation, safe change management, backups, physical safety, professionalism, incident response, and the newly-added area of responsibly using automation and AI.",
    "sections": [
      {
        "heading": "Documentation and support systems",
        "objectives": ["4.1"],
        "body": "Ticketing systems track support requests from creation through resolution, and they matter for reasons far beyond simple organization — they create a searchable history that helps identify recurring problems, and they hold individual technicians accountable for the specific work actually performed. SOPs (Standard Operating Procedures) are written, repeatable steps for common tasks, ensuring consistent outcomes regardless of which specific technician happens to be doing the work that day.\n\nAsset management tracks what hardware and software an organization actually owns, where it physically is, and who's currently responsible for it — foundational for both security (you can't secure or patch what you don't know exists) and simple budgeting. SLAs (Service Level Agreements) define the expected response and resolution time for a given type of support issue, setting a clear, measurable expectation both technicians and the users they support can be held to. A knowledge base is a searchable, shared repository of solutions to past problems, letting an organization avoid solving the exact same problem repeatedly from scratch every time it recurs."
      },
      {
        "heading": "Change management",
        "objectives": ["4.2"],
        "body": "Before any significant change to a production system, its scope needs to be clearly defined — precisely what's changing and, just as importantly, what deliberately isn't — so nothing important gets touched by accident along the way. Risk analysis considers what could realistically go wrong and how bad the actual impact would be if it did, which directly informs how much caution, and how much advance planning, a given change actually warrants.\n\nThe approval process ensures a proposed change is reviewed by the appropriate people before it happens, so no one can make a risky, disruptive change unilaterally without any oversight. A backout plan is the specific, pre-written procedure for undoing a change if it goes wrong, decided on before the change is made, not improvised afterward under pressure with a system already broken. Thorough documentation of what actually changed, and why, closes the loop — both for accountability after the fact and for the next person who eventually needs to understand exactly why a system is configured the particular way it currently is."
      },
      {
        "heading": "Backup and recovery",
        "objectives": ["4.3"],
        "body": "A full backup copies everything, every time — simple to restore from since it's complete on its own, but slow to create and consumes the most storage space of the three backup types. An incremental backup captures only what's changed since the most recent backup of any kind, making it fast and space-efficient to create, but a full restore requires the last full backup plus every single incremental made since then, applied in the correct order.\n\nA differential backup captures everything changed since the last full backup specifically, growing larger each day until the next full backup resets it — a middle ground that trades a bit more backup time and storage than incremental for a meaningfully simpler, faster restore process (just the last full backup plus one differential, rather than a whole chain of increments). The 3-2-1 rule is a widely-followed backup strategy: keep at least 3 copies of important data, on at least 2 different types of media, with at least 1 copy stored offsite — specifically to survive not just a single drive failure, but an entire site-level disaster like a fire or flood taking out everything in one physical location at once. Testing backups regularly — actually attempting a real restore, not just assuming a backup job completing successfully means the data is genuinely recoverable — is the step most often skipped, and the exact one that determines whether a backup strategy is real protection or just a comfortable illusion of protection."
      },
      {
        "heading": "Professionalism and incident response",
        "objectives": ["4.5", "4.6"],
        "body": "Professional communication means actively listening to a user's actual problem without interrupting, avoiding jargon they likely won't understand, and maintaining a genuinely respectful, patient tone even when a situation or a user is frustrating — a skill the exam treats as seriously as any technical one, and for good reason, since it directly shapes whether a user trusts and cooperates with IT going forward. Respecting a user's privacy means not looking at personal files or data beyond exactly what's necessary to resolve the specific issue at hand. Understanding software licensing (and not installing unlicensed software) and following an organization's AUP (Acceptable Use Policy) round out the core expectations for day-to-day professional conduct. Remote support brings its own etiquette on top of all of this — clearly explaining what you're about to do, especially before taking any control of a user's system, rather than silently taking over without a heads-up.\n\nIncident response follows a specific process, and — much like the malware-removal steps earlier — the exam tests the order, not just the individual pieces. Identification recognizes that a genuine security incident (not just a routine technical problem) is actually occurring in the first place. Containment limits the damage and prevents further spread once an incident is confirmed. Evidence — logs, affected systems, relevant details — needs to be properly preserved throughout, both for the internal investigation and for any potential legal proceedings that might follow later. Reporting follows an organization's specific, established incident response plan, notifying the right people through the right channel. Lessons learned closes the loop, similar in spirit to root cause analysis — figuring out how the incident actually happened and what changes would prevent a genuine repeat, not just cleaning up this one occurrence and moving on."
      },
      {
        "heading": "Automation and AI",
        "objectives": ["4.7"],
        "body": "Scripting automates repetitive tasks — batch files, PowerShell scripts, and similar tools can perform in seconds what would take a technician performing the same steps by hand across many machines a genuinely long time, and scripting skill has become an increasingly expected, practical part of the modern support role rather than a specialized, optional extra. Generative AI tools are an increasingly common part of the same modern IT toolkit — capable of helping draft documentation, suggest a starting point for troubleshooting an unfamiliar problem, or even generate a first draft of a script — but they come with real responsibility attached, not a free pass to skip understanding the work.\n\nVerification means never blindly trusting AI-generated output, whether that's a script or a piece of technical advice, without actually checking that it's correct and genuinely appropriate for the specific situation at hand before relying on it. Privacy considerations matter here specifically because sensitive organizational data should generally not be pasted into a public AI tool without a clear understanding of exactly how that tool stores, uses, and potentially trains on the data submitted to it. Appropriate use means understanding an organization's specific policy on AI tools (which increasingly exists as its own distinct category of policy) and applying sound professional judgment about when automation and AI genuinely help versus when a task still, deliberately, calls for direct human judgment and hands-on attention instead."
      },
      {
        "heading": "Tickets, assets, and employee lifecycle",
        "objectives": [
          "4.1"
        ],
        "body": "Order tickets by severity — the combination of impact and urgency — rather than arrival time, and record a clear problem description, each step taken, and the resolution so the next technician (and the knowledge base) can use it. Asset records follow the full life cycle: procurement, deployment and assignment, maintenance, and retirement.\n\nChecklists keep onboarding and offboarding consistent. A new-user checklist covers accounts, access, hardware, and training; a termination checklist disables access first, collects equipment and badges, and preserves or reassigns data."
      },
      {
        "heading": "More change-management practice",
        "objectives": [
          "4.2"
        ],
        "body": "Test changes in a sandbox that mirrors production before they go live, schedule them in a maintenance window when few people are affected, and announce them to stakeholders. After implementation, end users confirm the change works for their real workflows (end-user acceptance) before it is closed.\n\nStandard changes are pre-approved, low-risk, and repeatable, while an emergency change is fast-tracked to fix a critical outage and reviewed afterwards."
      },
      {
        "heading": "Backup objectives and storage",
        "objectives": [
          "4.3"
        ],
        "body": "A synthetic full backup is assembled on the backup server from the last full and later incrementals, so the source is not read again. Off-site copies (a vault or the cloud) survive a site disaster, whereas on-site copies restore faster but are lost with the building. A snapshot is a quick rollback point on the same storage, not a replacement for a backup.\n\nTwo targets drive the design: the recovery point objective (RPO) is how much data you can afford to lose and so sets the backup frequency, and the recovery time objective (RTO) is how long you can be down and so sets how fast recovery must be."
      },
      {
        "heading": "Safety and environmental controls",
        "objectives": [
          "4.4"
        ],
        "body": "Before opening equipment, shut it down, unplug it, remove the battery where possible, and discharge residual power; an ESD strap protects components, not you. PPE protects the person: goggles for debris, an air filtration mask for dust and toner, and gloves for sharp or hot parts.\n\nKeep equipment rooms cool with humidity around 40 to 60 percent (too dry invites static, too humid causes corrosion), use a UPS for battery backup during outages (a surge protector only absorbs spikes), and remove dust with compressed air or an ESD-safe vacuum while holding fans still."
      },
      {
        "heading": "Policies, data rules, and customer communication",
        "objectives": [
          "4.5"
        ],
        "body": "If you find prohibited or illegal content, stop, preserve the device as it is, and report it — never delete, copy, or show it. Regulated data has its own rules (PCI DSS for payment cards, HIPAA for health records, GDPR for EU personal data), a retention policy states how long to keep records and when to destroy them, and license type matters: free for personal use rarely covers business, and DRM restricts copying of licensed content.\n\nGood customer handling is a technical skill too: listen actively without interrupting, restate the problem, stay calm with difficult customers, set honest expectations, and follow up to confirm the customer is satisfied."
      },
      {
        "heading": "Scripting languages and risks",
        "objectives": [
          "4.8"
        ],
        "body": "Match the extension to the language and platform: .bat is a Windows batch file run by cmd.exe, .ps1 is PowerShell (Windows administration, governed by the execution policy), .vbs is legacy Windows scripting, .sh is a Bash or shell script for Linux and macOS, .js is JavaScript for browsers and Node.js, and .py is cross-platform Python.\n\nScripts are powerful, which is also the risk: an untrusted or untested script can introduce malware, change settings unintentionally, or crash a system. Review the code, test it in a sandbox, and run it with least privilege."
      },
      {
        "heading": "Remote access technologies",
        "objectives": [
          "4.9"
        ],
        "body": "RDP provides graphical Windows sessions over TCP 3389 (Pro or higher on the host), SSH provides encrypted command-line access and file transfer over TCP 22 and replaces clear-text Telnet, and VNC shares a desktop across operating systems but should be tunneled because its native encryption is weak. Quick Assist is a consent-based, one-time-code session, while an RMM platform installs an agent on every endpoint so IT can monitor, patch, script, and control many devices from one console.\n\nWhatever the tool, secure it: require MFA, connect through a VPN or gateway, use least privilege, log sessions, and never expose RDP directly to the Internet."
      },
      {
        "heading": "AI limitations, policy, and data",
        "objectives": [
          "4.10"
        ],
        "body": "Generative AI can hallucinate (state invented facts confidently), reflect bias from its training data, and echo copyrighted material, so output is a draft to verify and attribute rather than an authority. Hallucination and bias are different problems: one is made-up information and the other is a systematic unfairness.\n\nData handling matters most in practice: public AI services may retain or learn from prompts, so sensitive data belongs only in a private, governed service, and an AI use policy spells out which tools are approved, what data must never be entered, and what review is required."
      }
    ]
  }
  ];
})();
