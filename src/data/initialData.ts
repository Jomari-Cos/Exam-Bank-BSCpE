import { User, Course, Question, AuditLog, SystemSettings, Examination } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Engr. Elena Santos, PECE',
    email: 'esantos@bscpe.edu.ph',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    department: 'Computer Engineering Department',
    title: 'Department Chair & System Administrator',
    active: true,
    avatarInitials: 'ES',
  },
  {
    id: 'usr-admin-owner',
    name: 'Department Administrator',
    email: 'jcos83531@gmail.com',
    username: 'jcos83531',
    password: 'admin123',
    role: 'admin',
    department: 'Computer Engineering Department',
    title: 'Lead Administrator & Security Officer',
    active: true,
    avatarInitials: 'DA',
  },
  {
    id: 'usr-fac-1',
    name: 'Engr. Marcus Vance, M.Eng.',
    email: 'mvance@bscpe.edu.ph',
    username: 'mvance',
    password: 'faculty123',
    role: 'faculty',
    department: 'Hardware & Embedded Systems Division',
    title: 'Assistant Professor (Microprocessors & Architecture)',
    active: true,
    avatarInitials: 'MV',
  },
  {
    id: 'usr-fac-2',
    name: 'Engr. Sarah Chen, MSCS',
    email: 'schen@bscpe.edu.ph',
    username: 'schen',
    password: 'faculty123',
    role: 'faculty',
    department: 'Computing & Software Division',
    title: 'Instructor (Programming & Data Structures)',
    active: true,
    avatarInitials: 'SC',
  },
  {
    id: 'usr-rev-1',
    name: 'Dr. Roberto Gomez, PhD',
    email: 'rgomez@bscpe.edu.ph',
    username: 'reviewer',
    password: 'reviewer123',
    role: 'reviewer',
    department: 'Curriculum & Quality Assurance Committee',
    title: 'Senior Question Reviewer & Associate Dean',
    active: true,
    avatarInitials: 'RG',
  },
  {
    id: 'usr-exam-1',
    name: 'Engr. Patricia Reyes, M.Eng.',
    email: 'preyes@bscpe.edu.ph',
    username: 'examiner',
    password: 'examiner123',
    role: 'examiner',
    department: 'Department Assessment & Testing Office',
    title: 'Assessment Coordinator & Head Examiner',
    active: true,
    avatarInitials: 'PR',
  },
];

export const INITIAL_COURSES: Course[] = [
  // Programming
  {
    id: 'crs-prog-1',
    code: 'CPE-111',
    name: 'Programming Fundamentals',
    category: 'Programming',
    description: 'Introduction to algorithmic problem solving, syntax, control structures, and functional decomposition.',
    credits: 3,
    yearLevel: 1,
    topics: ['Variables & Data Types', 'Control Flow & Loops', 'Functions & Scope', 'Arrays & Strings', 'Modular Programming'],
    learningOutcomes: ['CLO-1: Formulate algorithmic solutions', 'CLO-2: Implement structured code', 'CLO-3: Debug syntax and logical errors'],
  },
  {
    id: 'crs-prog-2',
    code: 'CPE-112',
    name: 'C/C++ Programming',
    category: 'Programming',
    description: 'Low-level systems programming in C and modern C++, memory models, pointers, and manual resource allocation.',
    credits: 3,
    yearLevel: 1,
    topics: ['Pointers & Memory Addresses', 'Dynamic Memory (malloc/free)', 'Structures & Unions', 'Bitwise Operations', 'File I/O'],
    learningOutcomes: ['CLO-1: Master pointer arithmetic and reference semantics', 'CLO-2: Prevent memory leaks and segmentation faults', 'CLO-3: Manipulate hardware bitfields'],
  },
  {
    id: 'crs-prog-3',
    code: 'CPE-121',
    name: 'Python for Engineers',
    category: 'Programming',
    description: 'Scientific computing, data manipulation, automation scripts, and numerical simulation using Python.',
    credits: 3,
    yearLevel: 1,
    topics: ['List Comprehensions', 'NumPy & Matrices', 'Object-Oriented Python', 'Exception Handling', 'File Processing'],
    learningOutcomes: ['CLO-1: Build numerical analysis routines', 'CLO-2: Parse engineering datasets', 'CLO-3: Implement clean idiomatic scripts'],
  },
  {
    id: 'crs-prog-4',
    code: 'CPE-212',
    name: 'Object-Oriented Programming (Java)',
    category: 'Programming',
    description: 'Principles of OOP including encapsulation, inheritance, polymorphism, design patterns, and JVM runtime.',
    credits: 3,
    yearLevel: 2,
    topics: ['Encapsulation & Access Modifiers', 'Inheritance & Abstract Classes', 'Interfaces & Polymorphism', 'Collections Framework', 'Multithreading'],
    learningOutcomes: ['CLO-1: Model complex domains via class hierarchies', 'CLO-2: Apply polymorphic design principles', 'CLO-3: Handle asynchronous concurrent operations'],
  },
  {
    id: 'crs-prog-5',
    code: 'CPE-221',
    name: 'Data Structures and Algorithms',
    category: 'Programming',
    description: 'Linear and non-linear data structures, asymptotic algorithmic complexity analysis, sorting, graph traversal.',
    credits: 4,
    yearLevel: 2,
    topics: ['Stacks & Queues', 'Linked Lists & Doubly Linked Lists', 'Binary Search Trees & AVL Trees', 'Heap & Priority Queues', 'Graph Traversal (BFS/DFS)', 'Dynamic Programming'],
    learningOutcomes: ['CLO-1: Evaluate Big-O time and space complexity', 'CLO-2: Implement tree and graph algorithms', 'CLO-3: Optimize memory usage for embedded systems'],
  },

  // Computer Engineering Core
  {
    id: 'crs-cpe-1',
    code: 'CPE-211',
    name: 'Digital Logic Design',
    category: 'Computer Engineering',
    description: 'Combinational and sequential logic, Boolean minimization, Karnaugh maps, flip-flops, registers, counters, and FSM design.',
    credits: 4,
    yearLevel: 2,
    topics: ['Boolean Algebra & De Morgan Laws', 'Karnaugh Maps (K-Maps)', 'Multiplexers & Decoders', 'Latches & Flip-Flops (SR, D, JK, T)', 'Synchronous Finite State Machines', 'Timing Diagrams & Setup/Hold Times'],
    learningOutcomes: ['CLO-1: Minimize combinational logic expressions', 'CLO-2: Synthesize synchronous sequential state machines', 'CLO-3: Analyze setup and hold timing constraints'],
  },
  {
    id: 'crs-cpe-2',
    code: 'CPE-222',
    name: 'Computer Organization',
    category: 'Computer Engineering',
    description: 'Instruction set architecture, arithmetic logic units, data representation, Booth algorithm, and bus topologies.',
    credits: 3,
    yearLevel: 2,
    topics: ['Two’s Complement Arithmetic', 'Booth’s Multiplication Algorithm', 'ALU Design & Carry Lookahead', 'Register Transfer Language (RTL)', 'Memory Addressing Modes'],
    learningOutcomes: ['CLO-1: Calculate fixed-point and floating-point IEEE-754 numbers', 'CLO-2: Trace hardware register transfers', 'CLO-3: Design modular ALU datapath blocks'],
  },
  {
    id: 'crs-cpe-3',
    code: 'CPE-312',
    name: 'Computer Architecture',
    category: 'Computer Engineering',
    description: 'Pipelining, branch prediction, cache memory hierarchies, superscalar processors, and multi-core coherence.',
    credits: 3,
    yearLevel: 3,
    topics: ['5-Stage RISC Datapath', 'Pipeline Hazards (Data, Structural, Control)', 'Forwarding & Hazard Detection Units', 'Cache Mapping (Direct, Set-Associative, Fully Associative)', 'Virtual Memory & TLBs', 'MESI Cache Coherence'],
    learningOutcomes: ['CLO-1: Calculate CPU execution time and CPI', 'CLO-2: Resolve structural and data hazards with forwarding', 'CLO-3: Optimize cache hit rates across memory hierarchies'],
  },
  {
    id: 'crs-cpe-4',
    code: 'CPE-311',
    name: 'Microprocessors and Interfacing',
    category: 'Computer Engineering',
    description: 'x86 and ARM assembly, hardware interrupts, direct memory access (DMA), and peripheral interface adapters (8255, 8259).',
    credits: 4,
    yearLevel: 3,
    topics: ['x86 Registers & Addressing Modes', 'Interrupt Vector Table & PIC 8259', 'Memory Bus Interfacing & Address Decoding', 'DMA Controller 8237', 'Timer/Counter 8254 Configuration'],
    learningOutcomes: ['CLO-1: Write efficient low-level assembly routines', 'CLO-2: Interface memory chips to processor address buses', 'CLO-3: Implement hardware interrupt service routines'],
  },
  {
    id: 'crs-cpe-5',
    code: 'CPE-322',
    name: 'Microcontrollers and Embedded Systems',
    category: 'Computer Engineering',
    description: 'Bare-metal embedded firmware, ARM Cortex-M architecture, GPIO, timers, PWM, ADC/DAC, SPI/I2C/UART protocols.',
    credits: 4,
    yearLevel: 3,
    topics: ['ARM Cortex-M NVIC & Exception Model', 'GPIO Register Bit-Banging vs Hardware Peripherals', 'UART, SPI, and I2C Protocols', 'ADC Sampling & Nyquist Theorem', 'Timer PWM Generation & Motor Control'],
    learningOutcomes: ['CLO-1: Configure microcontroller peripheral registers', 'CLO-2: Implement real-time interrupt-driven sensor drivers', 'CLO-3: Analyze serial bus waveforms and timing packets'],
  },

  // Computing
  {
    id: 'crs-comp-1',
    code: 'CPE-313',
    name: 'Operating Systems',
    category: 'Computing',
    description: 'Kernel architectures, process synchronization, deadlocks, virtual memory paging, page replacement, and file systems.',
    credits: 3,
    yearLevel: 3,
    topics: ['Process State Lifecycle & PCB', 'CPU Scheduling (Round Robin, SJF, Priority)', 'Semaphores & Mutex Locks', 'Banker’s Deadlock Avoidance Algorithm', 'Paging, Segmentation & Page Faults', 'Inodes & Ext4 File System Layout'],
    learningOutcomes: ['CLO-1: Solve critical section concurrency hazards', 'CLO-2: Calculate turnaround and waiting times for CPU schedulers', 'CLO-3: Trace two-level page table virtual-to-physical address translation'],
  },
  {
    id: 'crs-comp-2',
    code: 'CPE-321',
    name: 'Computer Networks',
    category: 'Computing',
    description: 'OSI 7-layer & TCP/IP models, subnetting VLSM/CIDR, routing protocols, flow control, TCP congestion control, and network security.',
    credits: 3,
    yearLevel: 3,
    topics: ['IPv4 Subnetting & CIDR Calculation', 'TCP 3-Way Handshake & Connection Teardown', 'Sliding Window & Congestion Avoidance', 'Routing Protocols (OSPF vs BGP)', 'Ethernet Framing & CRC-32 Checksum', 'DNS & DHCP Resolution Sequence'],
    learningOutcomes: ['CLO-1: Subnet IP address blocks efficiently with VLSM', 'CLO-2: Analyze Wireshark packet captures and protocol headers', 'CLO-3: Compute cyclic redundancy check polynomials'],
  },
  {
    id: 'crs-comp-3',
    code: 'CPE-223',
    name: 'Database Systems',
    category: 'Computing',
    description: 'Relational data modeling, ER diagrams, normalization (1NF to BCNF), SQL queries, indexing, and ACID transactions.',
    credits: 3,
    yearLevel: 2,
    topics: ['Entity-Relationship Diagramming', 'Relational Algebra', 'Normalization (1NF, 2NF, 3NF, BCNF)', 'Complex SQL Joins & Subqueries', 'ACID Properties & Two-Phase Locking', 'B-Tree & Hash Indexes'],
    learningOutcomes: ['CLO-1: Normalize denormalized schemas up to BCNF', 'CLO-2: Write performant analytical SQL queries', 'CLO-3: Guarantee ACID compliance in transactional workflows'],
  },
  {
    id: 'crs-comp-4',
    code: 'CPE-323',
    name: 'Software Engineering',
    category: 'Computing',
    description: 'Agile development, software design patterns, UML modeling, unit testing, CI/CD pipelines, and clean architecture.',
    credits: 3,
    yearLevel: 3,
    topics: ['Agile Scrum Ceremonies', 'UML Class & Sequence Diagrams', 'SOLID Principles & Design Patterns', 'Unit Testing & Mocking', 'Continuous Integration / Continuous Deployment'],
    learningOutcomes: ['CLO-1: Produce architectural UML sequence models', 'CLO-2: Refactor code adhering to SOLID principles', 'CLO-3: Formulate test suites with high code coverage'],
  },

  // Advanced Courses
  {
    id: 'crs-adv-1',
    code: 'CPE-413',
    name: 'FPGA and Verilog/VHDL Design',
    category: 'Advanced Courses',
    description: 'Hardware description languages, synthesizable RTL, FPGA architecture (LUTs, DSP slices, BRAM), and clock domain crossing.',
    credits: 3,
    yearLevel: 4,
    topics: ['Verilog Continuous Assignment (assign)', 'Blocking (=) vs Non-blocking (<=) Assignments', 'Finite State Machine Synthesizable Coding', 'FPGA Configurable Logic Blocks (CLBs) & LUTs', 'Static Timing Analysis & Clock Jitter'],
    learningOutcomes: ['CLO-1: Write synthesizable Verilog HDL modules', 'CLO-2: Avoid unintended latch generation in always blocks', 'CLO-3: Synthesize and place-and-route digital designs onto FPGA hardware'],
  },
  {
    id: 'crs-adv-2',
    code: 'CPE-412',
    name: 'Internet of Things (IoT)',
    category: 'Advanced Courses',
    description: 'IoT sensor nodes, MQTT/CoAP protocols, edge computing, wireless sensor mesh networks, and cloud telemetry ingestion.',
    credits: 3,
    yearLevel: 4,
    topics: ['MQTT Publish/Subscribe QoS Levels', 'CoAP RESTful Constrained Architecture', 'BLE & Zigbee Wireless Topologies', 'Low-Power Sleep Modes & Energy Harvesting', 'Edge Micro-Inference on Microcontrollers'],
    learningOutcomes: ['CLO-1: Architect scalable MQTT edge-to-cloud topologies', 'CLO-2: Calculate power budgets for battery-operated nodes', 'CLO-3: Secure IoT wireless payload transmission'],
  },
  {
    id: 'crs-adv-3',
    code: 'CPE-421',
    name: 'Computer & Network Security',
    category: 'Advanced Courses',
    description: 'Cryptographic algorithms, public key infrastructure, buffer overflow exploits, firewalls, and hardware security.',
    credits: 3,
    yearLevel: 4,
    topics: ['Symmetric AES vs Asymmetric RSA', 'Diffie-Hellman Key Exchange', 'Stack Smashing & Buffer Overflow Mechanics', 'Hardware Root of Trust & Secure Boot', 'TLS 1.3 Handshake & Cipher Suites'],
    learningOutcomes: ['CLO-1: Dissect stack layout vulnerabilities', 'CLO-2: Implement secure cryptographic hashing & signatures', 'CLO-3: Harden embedded device boot firmware'],
  },
  {
    id: 'crs-adv-4',
    code: 'CPE-422',
    name: 'Robotics Engineering',
    category: 'Advanced Courses',
    description: 'Kinematics, forward and inverse kinematics, robot operating system (ROS 2), motor PID tuning, and SLAM.',
    credits: 3,
    yearLevel: 4,
    topics: ['Denavit-Hartenberg (DH) Convention', 'Forward & Inverse Kinematics Matrices', 'PID Velocity & Position Tuning', 'LiDAR 2D SLAM Mapping', 'ROS 2 Nodes, Topics, & Actions'],
    learningOutcomes: ['CLO-1: Compute end-effector coordinates with DH tables', 'CLO-2: Tune PID loops for actuator stability', 'CLO-3: Orchestrate robotic perception via ROS 2 nodes'],
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  // 1. MULTIPLE CHOICE (Computer Architecture) - Approved
  {
    id: 'Q-CPE-2026-001',
    courseId: 'crs-cpe-3',
    courseCode: 'CPE-312',
    courseName: 'Computer Architecture',
    topic: 'Cache Mapping (Direct, Set-Associative, Fully Associative)',
    type: 'multiple_choice',
    question: 'A 32-bit byte-addressable processor has a 64 KB 4-way set-associative cache with 64-byte blocks. How many bits are allocated for the Tag, Set Index, and Block Offset fields respectively?',
    difficulty: 'Medium',
    learningOutcome: 'CLO-3: Optimize cache hit rates across memory hierarchies',
    points: 2,
    authorId: 'usr-fac-1',
    authorName: 'Engr. Marcus Vance, M.Eng.',
    reviewerId: 'usr-rev-1',
    reviewerName: 'Dr. Roberto Gomez, PhD',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Approved',
    dateCreated: '2026-02-10',
    dateModified: '2026-02-12',
    explanation: '1. Block size = 64 bytes = 2^6 bytes -> Offset = 6 bits.\n2. Total cache size = 64 KB = 65,536 bytes.\n3. Number of lines = 65,536 / 64 = 1,024 lines.\n4. Since it is 4-way set associative: Number of Sets = 1,024 / 4 = 256 sets = 2^8 -> Index = 8 bits.\n5. Address width = 32 bits -> Tag = 32 - (8 + 6) = 18 bits.\nTherefore: Tag = 18 bits, Index = 8 bits, Offset = 6 bits.',
    choices: [
      'Tag: 18 bits, Index: 8 bits, Offset: 6 bits',
      'Tag: 16 bits, Index: 10 bits, Offset: 6 bits',
      'Tag: 20 bits, Index: 6 bits, Offset: 6 bits',
      'Tag: 19 bits, Index: 7 bits, Offset: 6 bits'
    ],
    correctAnswer: 'Tag: 18 bits, Index: 8 bits, Offset: 6 bits',
    randomizeChoices: true,
    reviews: [
      {
        id: 'rev-01',
        reviewerId: 'usr-rev-1',
        reviewerName: 'Dr. Roberto Gomez, PhD',
        date: '2026-02-12',
        action: 'Approved',
        comments: 'Excellent calculation question with unambiguous parameters. Math checks out perfectly.',
        criteriaChecks: {
          syllabusAligned: true,
          clarityVerified: true,
          answerKeyVerified: true,
          difficultyAppropriate: true
        }
      }
    ],
    history: [
      { id: 'h-1', timestamp: '2026-02-10 09:30', userId: 'usr-fac-1', userName: 'Engr. Marcus Vance', action: 'Created question as Draft' },
      { id: 'h-2', timestamp: '2026-02-11 14:15', userId: 'usr-fac-1', userName: 'Engr. Marcus Vance', action: 'Submitted for Review' },
      { id: 'h-3', timestamp: '2026-02-12 11:00', userId: 'usr-rev-1', userName: 'Dr. Roberto Gomez', action: 'Approved question' },
    ]
  },

  // 2. TRUE OR FALSE (Digital Logic Design) - Approved
  {
    id: 'Q-CPE-2026-002',
    courseId: 'crs-cpe-1',
    courseCode: 'CPE-211',
    courseName: 'Digital Logic Design',
    topic: 'Latches & Flip-Flops (SR, D, JK, T)',
    type: 'true_false',
    question: 'In an edge-triggered D flip-flop, the setup time ($t_{setup}$) is the minimum duration the data input $D$ must remain stable AFTER the active clock transition edge occurs.',
    difficulty: 'Easy',
    learningOutcome: 'CLO-3: Analyze setup and hold timing constraints',
    points: 1,
    authorId: 'usr-fac-1',
    authorName: 'Engr. Marcus Vance, M.Eng.',
    reviewerId: 'usr-rev-1',
    reviewerName: 'Dr. Roberto Gomez, PhD',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Approved',
    dateCreated: '2026-02-14',
    dateModified: '2026-02-15',
    explanation: 'FALSE. Setup time ($t_{setup}$) is the minimum time the data input must remain stable BEFORE the active clock transition. The duration data must remain stable AFTER the clock edge is called the hold time ($t_{hold}$).',
    trueFalseAnswer: false,
    correctAnswer: 'False',
    reviews: [
      {
        id: 'rev-02',
        reviewerId: 'usr-rev-1',
        reviewerName: 'Dr. Roberto Gomez, PhD',
        date: '2026-02-15',
        action: 'Approved',
        comments: 'Clear distinction between setup and hold time. Standard exam item.',
      }
    ]
  },

  // 3. MATCHING TYPE (Computer Networks) - Approved
  {
    id: 'Q-CPE-2026-003',
    courseId: 'crs-comp-2',
    courseCode: 'CPE-321',
    courseName: 'Computer Networks',
    topic: 'OSI 7-layer & TCP/IP models',
    type: 'matching',
    question: 'Match each Protocol Data Unit (PDU) and networking standard with its corresponding OSI Reference Model Layer.',
    difficulty: 'Medium',
    learningOutcome: 'CLO-2: Analyze Wireshark packet captures and protocol headers',
    points: 4,
    authorId: 'usr-fac-2',
    authorName: 'Engr. Sarah Chen, MSCS',
    reviewerId: 'usr-rev-1',
    reviewerName: 'Dr. Roberto Gomez, PhD',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Approved',
    dateCreated: '2026-02-15',
    dateModified: '2026-02-18',
    explanation: 'Transport Layer operates with Segments/Datagrams; Network Layer operates with Packets/IP; Data Link Layer operates with Frames/MAC; Physical Layer operates with Bits/Signals.',
    matchingInstructions: 'Pair each Item in List A with its correct corresponding Layer in List B.',
    matchingPairs: [
      { id: 'm1', itemA: 'Segment (TCP header, port numbers)', itemB: 'Layer 4 - Transport Layer' },
      { id: 'm2', itemA: 'Packet (Logical IP addressing, TTL)', itemB: 'Layer 3 - Network Layer' },
      { id: 'm3', itemA: 'Frame (Physical MAC addresses, FCS CRC)', itemB: 'Layer 2 - Data Link Layer' },
      { id: 'm4', itemA: 'Bitstream (Manchester encoding, voltages)', itemB: 'Layer 1 - Physical Layer' },
    ],
    randomizeListB: true,
    correctAnswer: 'm1 -> Layer 4, m2 -> Layer 3, m3 -> Layer 2, m4 -> Layer 1',
    reviews: [
      {
        id: 'rev-03',
        reviewerId: 'usr-rev-1',
        reviewerName: 'Dr. Roberto Gomez, PhD',
        date: '2026-02-18',
        action: 'Approved',
        comments: 'Accurate PDU definitions. Perfect matching question.',
      }
    ]
  },

  // 4. FILL IN THE BLANKS (Operating Systems) - Approved
  {
    id: 'Q-CPE-2026-004',
    courseId: 'crs-comp-1',
    courseCode: 'CPE-313',
    courseName: 'Operating Systems',
    topic: 'Semaphores & Mutex Locks',
    type: 'fill_blank',
    question: 'A [blank] is an integer variable used in concurrent programming that, apart from initialization, can only be accessed through two standard atomic operations: wait() (also known as P) and signal() (also known as V).',
    difficulty: 'Easy',
    learningOutcome: 'CLO-1: Solve critical section concurrency hazards',
    points: 2,
    authorId: 'usr-fac-2',
    authorName: 'Engr. Sarah Chen, MSCS',
    reviewerId: 'usr-rev-1',
    reviewerName: 'Dr. Roberto Gomez, PhD',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Approved',
    dateCreated: '2026-02-18',
    dateModified: '2026-02-20',
    explanation: 'E.W. Dijkstra introduced semaphores in 1965 with atomic operations wait (P, proberen) and signal (V, verhogen).',
    blankCorrectAnswers: ['semaphore'],
    alternativeAnswers: ['counting semaphore', 'binary semaphore', 'Semaphores'],
    isCaseSensitive: false,
    correctAnswer: 'semaphore',
  },

  // 5. CODING PROBLEM (C Programming / Embedded Systems) - Approved
  {
    id: 'Q-CPE-2026-005',
    courseId: 'crs-prog-2',
    courseCode: 'CPE-112',
    courseName: 'C/C++ Programming',
    topic: 'Bitwise Operations',
    type: 'coding_problem',
    question: 'Write a C function `uint32_t reverse_bits(uint32_t n)` that reverses the bit sequence of a 32-bit unsigned integer and returns the transformed integer.',
    difficulty: 'Medium',
    learningOutcome: 'CLO-3: Manipulate hardware bitfields',
    points: 10,
    authorId: 'usr-fac-1',
    authorName: 'Engr. Marcus Vance, M.Eng.',
    reviewerId: 'usr-rev-1',
    reviewerName: 'Dr. Roberto Gomez, PhD',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Approved',
    dateCreated: '2026-02-22',
    dateModified: '2026-02-25',
    explanation: 'Loop 32 times, shifting the result left by 1 and OR-ing with (n & 1), then shifting n right by 1.',
    programmingLanguage: 'C',
    problemDescription: 'In embedded device communications, peripheral SPI sensors sometimes transmit bytes in Least Significant Bit (LSB) first order, whereas the host ARM MCU expects Most Significant Bit (MSB) first order. Implement an efficient C function to reverse all 32 bits.',
    inputFormat: 'A single 32-bit unsigned integer n via standard input.',
    outputFormat: 'Print the resulting 32-bit unsigned integer value.',
    constraints: '0 <= n <= 4294967295 (2^32 - 1). Time complexity must be O(1) space and at most 32 operations.',
    sampleInput: '43261596',
    sampleOutput: '964176192',
    expectedSolution: `#include <stdio.h>
#include <stdint.h>

uint32_t reverse_bits(uint32_t n) {
    uint32_t result = 0;
    for (int i = 0; i < 32; i++) {
        result = (result << 1) | (n & 1);
        n >>= 1;
    }
    return result;
}

int main() {
    uint32_t n;
    if (scanf("%u", &n) == 1) {
        printf("%u\\n", reverse_bits(n));
    }
    return 0;
}`,
    testCases: [
      { id: 'tc1', input: '43261596', expectedOutput: '964176192', points: 3, isHidden: false, explanation: 'Binary 00000010100101000001111010011100 reversed' },
      { id: 'tc2', input: '1', expectedOutput: '2147483648', points: 3, isHidden: false, explanation: 'Least significant bit 1 becomes MSB 2^31' },
      { id: 'tc3', input: '0', expectedOutput: '0', points: 2, isHidden: true, explanation: 'All zeros reversed is zero' },
      { id: 'tc4', input: '4294967295', expectedOutput: '4294967295', points: 2, isHidden: true, explanation: 'All ones reversed is all ones' },
    ],
    correctAnswer: 'Bit reversal function using shift/mask loop or divide-and-conquer bit swaps.',
  },

  // 6. CODE OUTPUT (C Programming) - Approved
  {
    id: 'Q-CPE-2026-006',
    courseId: 'crs-prog-2',
    courseCode: 'CPE-112',
    courseName: 'C/C++ Programming',
    topic: 'Pointers & Memory Addresses',
    type: 'code_output',
    question: 'What is the exact console output of the following C program when compiled and executed on a 64-bit standard Linux system?',
    difficulty: 'Medium',
    learningOutcome: 'CLO-1: Master pointer arithmetic and reference semantics',
    points: 3,
    authorId: 'usr-fac-1',
    authorName: 'Engr. Marcus Vance, M.Eng.',
    reviewerId: 'usr-rev-1',
    reviewerName: 'Dr. Roberto Gomez, PhD',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Approved',
    dateCreated: '2026-02-24',
    dateModified: '2026-02-26',
    explanation: '1. `arr` has elements {10, 20, 30, 40, 50}.\n2. `ptr` points to `arr[0]` (10).\n3. `*(ptr++)` returns `*ptr` (10), then increments `ptr` to `&arr[1]`.\n4. `*(++ptr)` increments `ptr` to `&arr[2]`, then dereferences giving 30.\n5. `*ptr += 5` modifies `arr[2]` from 30 to 35.\n6. The loop prints: `10 20 35 40 50`.',
    codeSnippet: `#include <stdio.h>

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int *ptr = arr;

    int a = *(ptr++);
    int b = *(++ptr);
    *ptr += 5;

    for (int i = 0; i < 5; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    return 0;
}`,
    programmingLanguage: 'C',
    expectedOutput: '10 20 35 40 50',
    correctAnswer: '10 20 35 40 50',
  },

  // 7. DEBUGGING (Microcontrollers / Embedded Systems) - Approved
  {
    id: 'Q-CPE-2026-007',
    courseId: 'crs-cpe-5',
    courseCode: 'CPE-322',
    courseName: 'Microcontrollers and Embedded Systems',
    topic: 'ARM Cortex-M NVIC & Exception Model',
    type: 'debugging',
    question: 'The following embedded C routine attempts to poll a peripheral status register flag `ADC_READY` inside an interrupt-driven ISR environment, but it gets stuck in an infinite loop when compiler optimization (`-O2` or `-O3`) is enabled. Identify the missing C keyword, explain why the bug occurs, and provide the corrected line of code.',
    difficulty: 'Hard',
    learningOutcome: 'CLO-1: Configure microcontroller peripheral registers',
    points: 5,
    authorId: 'usr-fac-1',
    authorName: 'Engr. Marcus Vance, M.Eng.',
    reviewerId: 'usr-rev-1',
    reviewerName: 'Dr. Roberto Gomez, PhD',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Approved',
    dateCreated: '2026-03-01',
    dateModified: '2026-03-03',
    explanation: 'The compiler caches the value of `*status_reg` in a CPU register because it sees no local write inside the loop. Without `volatile`, the compiler generates code that only reads memory once, causing an infinite loop. Declaring `uint32_t * volatile` forces reading the actual hardware memory address on every iteration.',
    programmingLanguage: 'C',
    buggyCode: `// Peripheral Base Address for ADC Status Register
#define ADC_STATUS_REG  ((uint32_t *) 0x40012400)

void wait_for_adc_conversion(void) {
    uint32_t *status_reg = ADC_STATUS_REG;
    
    // BUG: Infinite loop under -O2/-O3 optimization!
    while ((*status_reg & 0x01) == 0) {
        // Wait for ADC end-of-conversion bit
    }
}`,
    expectedCorrection: `volatile uint32_t *status_reg = ADC_STATUS_REG;`,
    bugExplanation: 'Missing the `volatile` type qualifier. Without `volatile`, the optimizing compiler assumes memory contents do not change outside program control and optimizes the while loop into a single register check with an infinite branch.',
    correctAnswer: 'Add `volatile` qualifier to the status pointer (`volatile uint32_t * status_reg`)',
  },

  // 8. PROBLEM SOLVING (Computer Architecture) - Approved
  {
    id: 'Q-CPE-2026-008',
    courseId: 'crs-cpe-3',
    courseCode: 'CPE-312',
    courseName: 'Computer Architecture',
    topic: '5-Stage RISC Datapath',
    type: 'problem_solving',
    question: 'A 5-stage classic RISC processor (IF, ID, EX, MEM, WB) operates at a clock frequency of 2.5 GHz. An unpipelined program consists of 1,000,000 instructions where:\n- 40% are ALU instructions (take 1 cycle with forwarding)\n- 25% are Load instructions (half of which cause a 1-cycle load-use stall)\n- 15% are Store instructions (take 1 cycle)\n- 20% are Branch instructions (branch penalty is 2 cycles for taken branches; assume 60% of branches are taken)\n\nCalculate:\n1. The Average Cycles Per Instruction (CPI)\n2. The Total Execution Time in milliseconds ($ms$)',
    difficulty: 'Hard',
    learningOutcome: 'CLO-1: Calculate CPU execution time and CPI',
    points: 8,
    authorId: 'usr-fac-1',
    authorName: 'Engr. Marcus Vance, M.Eng.',
    reviewerId: 'usr-rev-1',
    reviewerName: 'Dr. Roberto Gomez, PhD',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Approved',
    dateCreated: '2026-03-05',
    dateModified: '2026-03-08',
    explanation: '1. Base ideal CPI = 1.0\n2. Load stall cycles = 0.25 * 0.50 * 1 = 0.125 cycles/instruction\n3. Branch stall cycles = 0.20 * 0.60 * 2 = 0.24 cycles/instruction\n4. Average CPI = 1.0 + 0.125 + 0.24 = 1.365\n5. Total cycles = 1,000,000 * 1.365 = 1,365,000 cycles\n6. Clock period T = 1 / (2.5 * 10^9 Hz) = 0.4 ns = 0.4 * 10^-9 seconds\n7. Total Time = 1,365,000 * 0.4 * 10^-9 s = 546,000 * 10^-9 s = 0.000546 s = 0.546 ms.',
    expectedAnswer: 'Average CPI = 1.365; Total Execution Time = 0.546 ms',
    correctAnswer: 'CPI = 1.365, Execution Time = 0.546 ms',
  },

  // 9. ALGORITHM TRACING (Data Structures & Algorithms) - Approved
  {
    id: 'Q-CPE-2026-009',
    courseId: 'crs-prog-5',
    courseCode: 'CPE-221',
    courseName: 'Data Structures and Algorithms',
    topic: 'Graph Traversal (BFS/DFS)',
    type: 'algorithm_tracing',
    question: 'Trace Dijkstra’s Single-Source Shortest Path algorithm on the following directed weighted graph starting from source vertex A. Trace the minimum distance array `dist[]` and the visited set at each step.',
    difficulty: 'Medium',
    learningOutcome: 'CLO-2: Implement tree and graph algorithms',
    points: 6,
    authorId: 'usr-fac-2',
    authorName: 'Engr. Sarah Chen, MSCS',
    reviewerId: 'usr-rev-1',
    reviewerName: 'Dr. Roberto Gomez, PhD',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Approved',
    dateCreated: '2026-03-10',
    dateModified: '2026-03-12',
    explanation: 'Initialization: dist[A]=0, all others=INF.\nStep 1: Extract A. Neighbors: dist[B]=4, dist[C]=2.\nStep 2: Extract C (dist=2). Neighbors of C: to B (cost 1, new dist=3 < 4, updated!), to D (cost 5, new dist=7).\nStep 3: Extract B (dist=3). Neighbors of B: to D (cost 2, new dist=5 < 7, updated!).\nStep 4: Extract D (dist=5). Final shortest distances: A:0, B:3, C:2, D:5.',
    tracingAlgorithm: `Graph Edges & Weights:
(A -> B, wt: 4)
(A -> C, wt: 2)
(C -> B, wt: 1)
(C -> D, wt: 5)
(B -> D, wt: 2)

Source Node: A
Nodes: {A, B, C, D}`,
    subQuestions: [
      { id: 'sq1', prompt: 'What is the shortest distance from node A to node B?', answer: '3 (via A -> C -> B)', points: 2 },
      { id: 'sq2', prompt: 'What is the shortest distance from node A to node D?', answer: '5 (via A -> C -> B -> D)', points: 2 },
      { id: 'sq3', prompt: 'Which vertex is extracted third from the priority queue?', answer: 'Vertex B', points: 2 },
    ],
    correctAnswer: 'A:0, B:3, C:2, D:5',
  },

  // 10. PSEUDOCODE (Computer Engineering / OS) - Approved
  {
    id: 'Q-CPE-2026-010',
    courseId: 'crs-comp-1',
    courseCode: 'CPE-313',
    courseName: 'Operating Systems',
    topic: 'CPU Scheduling (Round Robin, SJF, Priority)',
    type: 'pseudocode',
    question: 'Examine the following pseudocode for Round Robin process dispatching. Answer the questions regarding time quantum expiration and queue starvation.',
    difficulty: 'Medium',
    learningOutcome: 'CLO-2: Calculate turnaround and waiting times for CPU schedulers',
    points: 4,
    authorId: 'usr-fac-2',
    authorName: 'Engr. Sarah Chen, MSCS',
    reviewerId: 'usr-rev-1',
    reviewerName: 'Dr. Roberto Gomez, PhD',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Approved',
    dateCreated: '2026-03-12',
    dateModified: '2026-03-14',
    explanation: 'Round Robin maintains fair CPU allocation. If a process does not complete within time quantum Q, a timer interrupt forces a context switch and requeues it at the tail of the ready queue.',
    pseudocodeContent: `FUNCTION RoundRobinScheduler(readyQueue, timeQuantum):
    WHILE NOT readyQueue.isEmpty():
        currentProcess = readyQueue.dequeue()
        executeTime = MIN(currentProcess.remainingBurst, timeQuantum)
        
        simulateCPURun(currentProcess, executeTime)
        currentProcess.remainingBurst = currentProcess.remainingBurst - executeTime
        
        IF currentProcess.remainingBurst > 0 THEN
            // Process was preempted
            readyQueue.enqueue(currentProcess)
        ELSE
            currentProcess.state = TERMINATED
            recordCompletionTime(currentProcess)
        END IF
    END WHILE
END FUNCTION`,
    subQuestions: [
      { id: 'pq1', prompt: 'What occurs to a process when its remaining burst exceeds the time quantum?', answer: 'It is preempted and enqueued back at the tail of readyQueue.', points: 2 },
      { id: 'pq2', prompt: 'If the timeQuantum approaches infinity, what standard non-preemptive scheduling algorithm does Round Robin degrade into?', answer: 'First-Come, First-Served (FCFS)', points: 2 }
    ],
    correctAnswer: 'Preemption back to tail; Degrades to FCFS when quantum is very large.',
  },

  // 11. FLOWCHART (Digital Systems / FSM) - Approved
  {
    id: 'Q-CPE-2026-011',
    courseId: 'crs-cpe-1',
    courseCode: 'CPE-211',
    courseName: 'Digital Logic Design',
    topic: 'Synchronous Finite State Machines',
    type: 'flowchart',
    question: 'Analyze the logic decision flowchart for a Mealy Sequence Detector designed to detect the serial bit sequence `101` with overlapping allowed.',
    difficulty: 'Hard',
    learningOutcome: 'CLO-2: Synthesize synchronous sequential state machines',
    points: 6,
    authorId: 'usr-fac-1',
    authorName: 'Engr. Marcus Vance, M.Eng.',
    reviewerId: 'usr-rev-1',
    reviewerName: 'Dr. Roberto Gomez, PhD',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Approved',
    dateCreated: '2026-03-15',
    dateModified: '2026-03-16',
    explanation: 'State S0 (Reset/No bits matched). If 1 -> S1/out=0. In S1 (got 1), if 0 -> S2/out=0. In S2 (got 10), if 1 -> input bit completes sequence 101, output=1, and next state is S1 because the last bit 1 can serve as prefix for the next sequence (overlapping!).',
    flowchartType: 'description',
    flowchartContent: `[START / S0: Reset]
       │
       ├─ (bit=0) ──> Loop to S0 (out=0)
       └─ (bit=1) ──> [S1: Detected '1']
                         │
                         ├─ (bit=1) ──> Loop to S1 (out=0)
                         └─ (bit=0) ──> [S2: Detected '10']
                                           │
                                           ├─ (bit=0) ──> Branch to S0 (out=0)
                                           └─ (bit=1) ──> Branch to S1 (out=1) [Match Detected!]`,
    subQuestions: [
      { id: 'fq1', prompt: 'Given the serial input stream 1-1-0-1-0-1, what is the output bit sequence?', answer: '0-0-0-1-0-1 (Two detections at 4th and 6th clock cycles)', points: 3 },
      { id: 'fq2', prompt: 'Why does state S2 transition to S1 instead of S0 upon receiving input bit 1?', answer: 'Because the current bit 1 can form the beginning of a new overlapping 101 sequence.', points: 3 }
    ],
    correctAnswer: 'Output sequence 0-0-0-1-0-1; S1 transition retains overlapping prefix.',
  },

  // 12. SUBMITTED QUESTION (Awaiting Review by Reviewer)
  {
    id: 'Q-CPE-2026-012',
    courseId: 'crs-adv-1',
    courseCode: 'CPE-413',
    courseName: 'FPGA and Verilog/VHDL Design',
    topic: 'Blocking (=) vs Non-blocking (<=) Assignments',
    type: 'code_output',
    question: 'Consider the following Verilog clocked always block modeling a 2-stage shift register. What are the values of flip-flops `q1` and `q2` after one active positive clock edge if initially `q1 = 0`, `q2 = 1`, and `d = 1`?',
    difficulty: 'Medium',
    learningOutcome: 'CLO-2: Avoid unintended latch generation in always blocks',
    points: 3,
    authorId: 'usr-fac-1',
    authorName: 'Engr. Marcus Vance, M.Eng.',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Submitted',
    dateCreated: '2026-03-20',
    dateModified: '2026-03-20',
    explanation: 'Because non-blocking assignments (`<=`) evaluate right-hand side expressions concurrently at the clock edge and schedule updates at the end of the time step, `q2` receives the old value of `q1` (0), and `q1` receives `d` (1). Thus `q1 = 1, q2 = 0`.',
    programmingLanguage: 'Verilog/VHDL',
    codeSnippet: `always @(posedge clk) begin
    q1 <= d;
    q2 <= q1;
end`,
    expectedOutput: 'q1 = 1, q2 = 0',
    correctAnswer: 'q1 = 1, q2 = 0',
    history: [
      { id: 'h-12a', timestamp: '2026-03-20 14:00', userId: 'usr-fac-1', userName: 'Engr. Marcus Vance', action: 'Created question as Draft' },
      { id: 'h-12b', timestamp: '2026-03-20 16:30', userId: 'usr-fac-1', userName: 'Engr. Marcus Vance', action: 'Submitted question for Committee Review' },
    ]
  },

  // 13. DRAFT QUESTION (Faculty still editing)
  {
    id: 'Q-CPE-2026-013',
    courseId: 'crs-prog-4',
    courseCode: 'CPE-212',
    courseName: 'Object-Oriented Programming (Java)',
    topic: 'Encapsulation & Access Modifiers',
    type: 'multiple_choice',
    question: 'Which Java access modifier permits member accessibility to classes within the same package, but forbids access to subclasses located in different packages?',
    difficulty: 'Easy',
    learningOutcome: 'CLO-1: Model complex domains via class hierarchies',
    points: 1,
    authorId: 'usr-fac-2',
    authorName: 'Engr. Sarah Chen, MSCS',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Draft',
    dateCreated: '2026-03-22',
    dateModified: '2026-03-22',
    explanation: 'Default (package-private) modifier has no keyword and restricts visibility to the containing package only. `protected` would allow subclasses in other packages.',
    choices: ['default (no modifier)', 'private', 'protected', 'public'],
    correctAnswer: 'default (no modifier)',
    randomizeChoices: true,
    history: [
      { id: 'h-13a', timestamp: '2026-03-22 10:15', userId: 'usr-fac-2', userName: 'Engr. Sarah Chen', action: 'Created draft question' }
    ]
  },

  // 14. RETURNED QUESTION (Returned with feedback by Reviewer)
  {
    id: 'Q-CPE-2026-014',
    courseId: 'crs-cpe-4',
    courseCode: 'CPE-311',
    courseName: 'Microprocessors and Interfacing',
    topic: 'x86 Registers & Addressing Modes',
    type: 'multiple_choice',
    question: 'In the Intel 8086 microprocessor architecture, which register pair is automatically utilized as the default segment and offset registers for the stack operations PUSH and POP?',
    difficulty: 'Easy',
    learningOutcome: 'CLO-1: Write efficient low-level assembly routines',
    points: 1,
    authorId: 'usr-fac-1',
    authorName: 'Engr. Marcus Vance, M.Eng.',
    reviewerId: 'usr-rev-1',
    reviewerName: 'Dr. Roberto Gomez, PhD',
    academicYear: '2025-2026',
    semester: '1st Semester',
    status: 'Draft', // Returned to draft for revisions
    dateCreated: '2026-03-18',
    dateModified: '2026-03-19',
    explanation: 'SS (Stack Segment) and SP (Stack Pointer).',
    choices: ['SS:SP', 'CS:IP', 'DS:SI', 'ES:DI'],
    correctAnswer: 'SS:SP',
    randomizeChoices: true,
    reviews: [
      {
        id: 'rev-14',
        reviewerId: 'usr-rev-1',
        reviewerName: 'Dr. Roberto Gomez, PhD',
        date: '2026-03-19',
        action: 'Returned',
        comments: 'Please elaborate on the explanation to explain how the stack grows downward (decrementing SP) in x86, as required in the Midterm TOS rubric.',
        criteriaChecks: {
          syllabusAligned: true,
          clarityVerified: true,
          answerKeyVerified: true,
          difficultyAppropriate: true
        }
      }
    ],
    history: [
      { id: 'h-14a', timestamp: '2026-03-18 11:20', userId: 'usr-fac-1', userName: 'Engr. Marcus Vance', action: 'Created and submitted' },
      { id: 'h-14b', timestamp: '2026-03-19 09:10', userId: 'usr-rev-1', userName: 'Dr. Roberto Gomez', action: 'Returned with review feedback comments' }
    ]
  }
];

export const INITIAL_EXAMINATIONS: Examination[] = [
  {
    id: 'EXAM-CPE-2026-01',
    title: 'BSCpE 312: Computer Architecture Midterm Examination',
    courseId: 'crs-cpe-3',
    courseCode: 'CPE-312',
    courseName: 'Computer Architecture',
    term: 'Midterm',
    academicYear: '2025-2026',
    semester: '1st Semester',
    instructions: 'Read each question carefully. Write all answers on the official answer sheet provided. Electronic calculators are permitted for pipelining and cache arithmetic. Academic integrity policy is strictly enforced.',
    timeLimitMinutes: 90,
    totalPoints: 20,
    questionCount: 3,
    selectedQuestionIds: ['Q-CPE-2026-001', 'Q-CPE-2026-008', 'Q-CPE-2026-006'],
    versions: [
      {
        versionLabel: 'Set A',
        totalPoints: 20,
        questions: [
          {
            originalQuestionId: 'Q-CPE-2026-001',
            questionNumber: 1,
            questionText: 'A 32-bit byte-addressable processor has a 64 KB 4-way set-associative cache with 64-byte blocks. How many bits are allocated for the Tag, Set Index, and Block Offset fields respectively?',
            type: 'multiple_choice',
            points: 2,
            difficulty: 'Medium',
            topic: 'Cache Mapping',
            choices: [
              'Tag: 18 bits, Index: 8 bits, Offset: 6 bits',
              'Tag: 16 bits, Index: 10 bits, Offset: 6 bits',
              'Tag: 20 bits, Index: 6 bits, Offset: 6 bits',
              'Tag: 19 bits, Index: 7 bits, Offset: 6 bits'
            ],
            correctAnswerDisplay: 'Tag: 18 bits, Index: 8 bits, Offset: 6 bits',
            explanation: 'Tag = 18 bits, Index = 8 bits, Offset = 6 bits.',
          },
          {
            originalQuestionId: 'Q-CPE-2026-006',
            questionNumber: 2,
            questionText: 'What is the exact console output of the following C program when compiled and executed on a 64-bit standard Linux system?',
            type: 'code_output',
            points: 3,
            difficulty: 'Medium',
            topic: 'Pointers & Memory Addresses',
            codeSnippet: `#include <stdio.h>\n\nint main() {\n    int arr[] = {10, 20, 30, 40, 50};\n    int *ptr = arr;\n    int a = *(ptr++);\n    int b = *(++ptr);\n    *ptr += 5;\n    for (int i = 0; i < 5; i++) printf("%d ", arr[i]);\n    return 0;\n}`,
            programmingLanguage: 'C',
            correctAnswerDisplay: '10 20 35 40 50',
            explanation: 'Pointers increment and array modification results in: 10 20 35 40 50',
          },
          {
            originalQuestionId: 'Q-CPE-2026-008',
            questionNumber: 3,
            questionText: 'A 5-stage classic RISC processor (IF, ID, EX, MEM, WB) operates at a clock frequency of 2.5 GHz. An unpipelined program consists of 1,000,000 instructions where:\n- 40% are ALU instructions (take 1 cycle with forwarding)\n- 25% are Load instructions (half of which cause a 1-cycle load-use stall)\n- 15% are Store instructions (take 1 cycle)\n- 20% are Branch instructions (branch penalty is 2 cycles for taken branches; assume 60% of branches are taken)\n\nCalculate:\n1. The Average Cycles Per Instruction (CPI)\n2. The Total Execution Time in milliseconds (ms)',
            type: 'problem_solving',
            points: 15,
            difficulty: 'Hard',
            topic: '5-Stage RISC Datapath',
            correctAnswerDisplay: 'CPI = 1.365; Execution Time = 0.546 ms',
            explanation: 'CPI = 1.0 + 0.125 + 0.24 = 1.365. Time = 1,365,000 * 0.4ns = 0.546 ms.',
          }
        ]
      },
      {
        versionLabel: 'Set B',
        totalPoints: 20,
        questions: [
          {
            originalQuestionId: 'Q-CPE-2026-008',
            questionNumber: 1,
            questionText: 'A 5-stage classic RISC processor (IF, ID, EX, MEM, WB) operates at a clock frequency of 2.5 GHz. An unpipelined program consists of 1,000,000 instructions where:\n- 40% are ALU instructions (take 1 cycle with forwarding)\n- 25% are Load instructions (half of which cause a 1-cycle load-use stall)\n- 15% are Store instructions (take 1 cycle)\n- 20% are Branch instructions (branch penalty is 2 cycles for taken branches; assume 60% of branches are taken)\n\nCalculate:\n1. The Average Cycles Per Instruction (CPI)\n2. The Total Execution Time in milliseconds (ms)',
            type: 'problem_solving',
            points: 15,
            difficulty: 'Hard',
            topic: '5-Stage RISC Datapath',
            correctAnswerDisplay: 'CPI = 1.365; Execution Time = 0.546 ms',
            explanation: 'CPI = 1.0 + 0.125 + 0.24 = 1.365. Time = 1,365,000 * 0.4ns = 0.546 ms.',
          },
          {
            originalQuestionId: 'Q-CPE-2026-001',
            questionNumber: 2,
            questionText: 'A 32-bit byte-addressable processor has a 64 KB 4-way set-associative cache with 64-byte blocks. How many bits are allocated for the Tag, Set Index, and Block Offset fields respectively?',
            type: 'multiple_choice',
            points: 2,
            difficulty: 'Medium',
            topic: 'Cache Mapping',
            choices: [
              'Tag: 20 bits, Index: 6 bits, Offset: 6 bits',
              'Tag: 18 bits, Index: 8 bits, Offset: 6 bits',
              'Tag: 16 bits, Index: 10 bits, Offset: 6 bits',
              'Tag: 19 bits, Index: 7 bits, Offset: 6 bits'
            ],
            correctAnswerDisplay: 'Tag: 18 bits, Index: 8 bits, Offset: 6 bits',
            explanation: 'Tag = 18 bits, Index = 8 bits, Offset = 6 bits.',
          },
          {
            originalQuestionId: 'Q-CPE-2026-006',
            questionNumber: 3,
            questionText: 'What is the exact console output of the following C program when compiled and executed on a 64-bit standard Linux system?',
            type: 'code_output',
            points: 3,
            difficulty: 'Medium',
            topic: 'Pointers & Memory Addresses',
            codeSnippet: `#include <stdio.h>\n\nint main() {\n    int arr[] = {10, 20, 30, 40, 50};\n    int *ptr = arr;\n    int a = *(ptr++);\n    int b = *(++ptr);\n    *ptr += 5;\n    for (int i = 0; i < 5; i++) printf("%d ", arr[i]);\n    return 0;\n}`,
            programmingLanguage: 'C',
            correctAnswerDisplay: '10 20 35 40 50',
            explanation: 'Pointers increment and array modification results in: 10 20 35 40 50',
          }
        ]
      }
    ],
    dateCreated: '2026-03-24',
    authorId: 'usr-exam-1',
    authorName: 'Engr. Patricia Reyes, M.Eng.',
    settings: {
      randomizeQuestions: true,
      randomizeChoices: true,
      headerInstitution: 'COLLEGE OF ENGINEERING AND ARCHITECTURE',
      departmentName: 'Department of Computer Engineering',
      examCode: 'CPE312-MID-2026',
      showPointsPerQuestion: true,
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-03-24 16:45:10',
    userId: 'usr-exam-1',
    userName: 'Engr. Patricia Reyes, M.Eng.',
    role: 'examiner',
    action: 'Examination Generated',
    targetType: 'Examination',
    targetId: 'EXAM-CPE-2026-01',
    details: 'Generated 2 versions (Set A & Set B) for CPE-312 Midterm Examination with randomized choices.',
  },
  {
    id: 'log-2',
    timestamp: '2026-03-20 16:30:22',
    userId: 'usr-fac-1',
    userName: 'Engr. Marcus Vance, M.Eng.',
    role: 'faculty',
    action: 'Question Submitted',
    targetType: 'Question',
    targetId: 'Q-CPE-2026-012',
    details: 'Submitted Verilog shift register question for peer review.',
  },
  {
    id: 'log-3',
    timestamp: '2026-03-19 09:10:04',
    userId: 'usr-rev-1',
    userName: 'Dr. Roberto Gomez, PhD',
    role: 'reviewer',
    action: 'Question Returned',
    targetType: 'Question',
    targetId: 'Q-CPE-2026-014',
    details: 'Returned 8086 stack register question with feedback to expand explanation.',
  },
  {
    id: 'log-4',
    timestamp: '2026-03-16 14:22:50',
    userId: 'usr-rev-1',
    userName: 'Dr. Roberto Gomez, PhD',
    role: 'reviewer',
    action: 'Question Approved',
    targetType: 'Question',
    targetId: 'Q-CPE-2026-011',
    details: 'Approved Mealy FSM 101 sequence detector flowchart question.',
  },
  {
    id: 'log-5',
    timestamp: '2026-03-10 08:30:00',
    userId: 'usr-admin-1',
    userName: 'Engr. Elena Santos, PECE',
    role: 'admin',
    action: 'System Configuration Updated',
    targetType: 'Settings',
    details: 'Updated Academic Year to 2025-2026 and synchronized syllabus learning outcomes.',
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  academicYear: '2025-2026',
  currentSemester: '1st Semester',
  gradingTerms: ['Prelim', 'Midterm', 'Semi-Final', 'Final'],
  institutionName: 'COLLEGE OF ENGINEERING & ARCHITECTURE',
  departmentName: 'Department of Computer Engineering',
  defaultTimeLimitMinutes: 90,
  requireReviewBeforeExam: true,
  minReviewersRequired: 1,
};
