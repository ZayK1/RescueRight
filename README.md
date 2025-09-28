# RescueRight: Smart Choking-Rescue Training System
## IDEATE 2025 Competition - Team 8 NUS

---

## 📋 Executive Summary

**RescueRight** is the world's first smart choking-rescue training vest with AI-powered coaching, developed by NUS IDEATE Team 8 for the IDEATE 2025 competition. Our innovative solution transforms traditional first aid training by embedding medical-grade sensors and real-time AI feedback into a wearable training vest, ensuring trainees learn precise, safe, and effective life-saving techniques.

### 🎯 Mission Statement
*"Transforming uncertain simulations into verified, life-saving skills"*

### 🏆 Competition Status
- ✅ **Successfully cleared PDR (Preliminary Design Review)**
- ✅ **Qualified for Semifinals** (October 15, 2025)
- 🎯 **Target**: Finals qualification with business pitch

---

## 👥 Team Members

| Name | Role | Expertise |
|------|------|-----------|
| **Ansh Bhaskar** | Market Analysis Lead | Business Strategy & Market Research |
| **Phua Kai Jie** | Pitch Lead | Communication & Presentation |
| **Kasim Zayan** | Product Differentiation Specialist | Competitive Analysis |
| **Serena Tang** | Technical Lead | Solution Architecture |
| **Daniel Yow** | Impact & Vision Lead | Strategic Planning |

---

## 🏛️ About IDEATE 2025

### Competition Overview

```mermaid
graph LR
    A[Idea Submission] --> B[PDR<br/>Preliminary Design Review]
    B --> C[Prototyping Phase<br/>Current Stage]
    C --> D[Semifinals<br/>Oct 15, 2025]
    D --> E[Finals<br/>Business Pitch]
    
    style C fill:#f9f,stroke:#333,stroke-width:4px
    style B fill:#9f9,stroke:#333,stroke-width:2px
```

### Key Resources Provided

#### 💰 Financial Support
- **Budget**: $100 SGD per team for prototyping
- **Reimbursement Process**: IRL approval → LPI form → Receipts → Bank statements to Alvin Poh

#### 🏭 Facilities Access
- **Electronics Lab**: Prototyping workspace (Mon-Fri 8:30am-6pm)
- **Studios 1-4 @ E2A**: Additional workspaces
- **Innovation & Design Hub @ EA**: Consultation space

#### 🛠️ Equipment & Services

| Category | Details | Access Method |
|----------|---------|---------------|
| **Loanable Consumables** | Batteries, wires, tapes, resistors | Email Alvin + Appointment |
| **Loanable Non-consumables** | Motors, sensors, hot glue gun, calipers | Email Alvin + Appointment |
| **In-Lab Tools** | Multimeter, soldering iron, heat gun | Use in lab only |
| **3D Printing** | Max 256x256x256mm, ~3 days lead | Job Request Form |
| **Laser Cutting** | 2-5mm acrylic (clear/black/white) | Job Request Form |

#### 👨‍🏫 Mentorship Program
- **Industrial Mentors**: 2 hours consultation (e.g., Hugh Mason, Chan Tong Leong)
- **Student Mentors**: Technical and strategic guidance
- **Selection Deadline**: September 11, 2025 (Completed ✅)

### 📅 Critical Dates & Deadlines

| Date | Milestone | Status |
|------|-----------|--------|
| September 11, 2025 | Safety declaration & quiz | ✅ Completed |
| September 24 - October 7, 2025 | MVP Development Sprint | 🔄 In Progress |
| **October 7, 2025 (18:00)** | Semifinals poster submission (A1 PDF) | 📋 Pending |
| **October 14, 2025 (18:00)** | Finals slides submission | 📋 Pending |
| **October 15, 2025** | Semifinals presentation | 🎯 Target |

---

## 🚨 The Critical Problem

### The Choking Crisis by Numbers

```mermaid
pie title "Choking Statistics Global Impact"
    "Deaths every 3 minutes" : 1
    "Brain damage onset (4 min)" : 1
    "Lifetime choking risk (33%)" : 1
    "Current training success rate (47%)" : 1
```

### Key Statistics

| Metric | Value | Source |
|--------|-------|--------|
| **Global choking deaths** | Every 3 minutes | SJTREM 2025 |
| **Brain damage onset** | 4 minutes after airway blockage | Resuscitation Council UK |
| **Lifetime choking risk** | 1 in 3 people (33%) | Medical research |
| **Heimlich success rate** | Only 47% | Japan EMS study |
| **Singapore annual trainees** | >120,000 people | Singapore Heart Foundation/SCDF |
| **Skill retention decline** | Significant after 3-6 months | Training studies |

### The Training Gap

```mermaid
graph TD
    A[Current Training Methods] --> B[Static Mannequins]
    A --> C[No Force Measurement]
    A --> D[Motion Simulation Only]
    
    B --> E[No Real Feedback]
    C --> F[Risk of Injury]
    D --> G[Inaccurate Assessment]
    
    E --> H[Low Confidence]
    F --> I[Fatal Injuries Possible]
    G --> J[Poor Real-World Performance]
    
    style A fill:#f99,stroke:#333,stroke-width:2px
    style H fill:#faa,stroke:#333,stroke-width:1px
    style I fill:#faa,stroke:#333,stroke-width:1px
    style J fill:#faa,stroke:#333,stroke-width:1px
```

### Consequences of Poor Training

#### ⚠️ Too Little Force
- Airway remains blocked
- Victim continues choking
- Death or brain damage

#### ⚠️ Too Much Force
- Gastric ruptures
- Rib fractures
- Myocardial injury
- Internal organ damage
- Especially dangerous for elderly/vulnerable groups

---

## 🔍 Current Training Method Limitations

### Traditional Equipment Problems

| Issue | Description | Impact |
|-------|-------------|--------|
| **Subpar Equipment** | Static mannequins, basic vests | Minimal skill transfer |
| **No Force Measurement** | Cannot verify correct pressure | Risk of injury/ineffectiveness |
| **Inaccurate Assessment** | "Going through motions" | False confidence |
| **High Student Ratios** | Limited instructor feedback | Unequal training quality |
| **Practice Safety Concerns** | Can't practice full-force | Unprepared for real emergencies |

### Competitive Landscape Analysis

```mermaid
graph LR
    subgraph "Current Solutions"
        A[Act+Fast Vest<br/>Purely Mechanical]
        B[Smart CPR Mannequins<br/>Wrong Application]
        C[Suction Devices<br/>Not Training Tools]
    end
    
    subgraph "Their Limitations"
        D[No Sensors]
        E[No Force Feedback]
        F[No Position Tracking]
        G[Not Guideline-Approved]
    end
    
    A --> D
    A --> E
    A --> F
    C --> G
    
    style A fill:#fdd,stroke:#333
    style B fill:#fdd,stroke:#333
    style C fill:#fdd,stroke:#333
```

---

## 💡 The Solution: RescueRight Smart Vest System

### System Architecture

```mermaid
graph TB
    subgraph "Hardware Layer"
        A[Smart Training Vest]
        B[Medical-Grade Sensors]
        C[Bluetooth/WiFi Module]
    end
    
    subgraph "Software Layer"
        D[Mobile App<br/>Android/iOS]
        E[AI Processing Engine]
        F[Analytics Dashboard]
    end
    
    subgraph "User Interface"
        G[Real-Time Feedback]
        H[Voice Coaching]
        I[Performance Metrics]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    E --> G
    E --> H
    F --> I
    
    style A fill:#9f9,stroke:#333,stroke-width:2px
    style D fill:#99f,stroke:#333,stroke-width:2px
    style E fill:#f9f,stroke:#333,stroke-width:2px
```

### 🎯 Core Features

#### 1. Precision Sensor Array

```mermaid
graph LR
    subgraph "Sensor Capabilities"
        A[Force Detection<br/>0-300N ±2N]
        B[Position Mapping<br/>1cm precision]
        C[Angle Analysis<br/>Thrust vectors]
        D[Depth Measurement<br/>Compression tracking]
        E[Rhythm Tracking<br/>Timing intervals]
    end
    
    style A fill:#afd,stroke:#333
    style B fill:#afd,stroke:#333
    style C fill:#afd,stroke:#333
    style D fill:#afd,stroke:#333
    style E fill:#afd,stroke:#333
```

**Technical Specifications:**
- **Sampling Rate**: 100Hz medical-grade pressure sensors
- **Force Range**: 0-300 Newtons with ±2N accuracy
- **Position Accuracy**: 1cm precision for hand placement
- **Real-time Processing**: Triangulation of force distribution
- **Calibration**: Automatic adjustment for different body types

#### 2. Real-Time AI Feedback System

##### Visual Guidance Components
| Feature | Description | Purpose |
|---------|-------------|---------|
| **Live Pressure Heatmap** | Color-coded force distribution | Instant visual feedback |
| **3D Hand Position Indicator** | Real-time hand placement tracking | Correct positioning |
| **Force Meter** | Green zone (80-120N optimal) | Safe force application |
| **Angle Indicator** | Thrust vector visualization | Proper technique |

##### Audio Coaching Features
- **Instant Corrections**: "Move hands 2cm higher"
- **Pressure Guidance**: "Increase pressure by 30%"
- **Rhythm Training**: "Thrust... release... thrust..."
- **Positive Reinforcement**: "Perfect pressure - maintain this"
- **Scenario Simulation**: Background noise, emergency timers

#### 3. Performance Analytics Dashboard

```mermaid
graph TD
    subgraph "Real-Time Display"
        A[Current Force]
        B[Position Accuracy]
        C[Angle Diagram]
        D[Success Rate]
    end
    
    subgraph "Post-Session Analytics"
        E[Force Consistency Graph]
        F[Position Improvement Tracking]
        G[Time to First Effective Thrust]
        H[Scenario Completion Rates]
        I[Skill Retention Metrics]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    D --> I
```

### 🔄 How It Works - Step by Step

```mermaid
sequenceDiagram
    participant T as Trainee
    participant V as Smart Vest
    participant R as Responder
    participant A as Mobile App
    participant AI as AI Engine
    
    T->>V: Wears vest (victim role)
    R->>V: Performs Heimlich maneuver
    V->>A: Streams sensor data (Bluetooth/WiFi)
    A->>AI: Processes data
    AI->>A: Generates feedback
    A->>R: Real-time coaching
    AI->>A: Stores performance data
    A->>R: Post-session analytics
    R->>T: Improved technique
```

---

## 📊 Market Analysis & Business Strategy

### Target Customer Segments

```mermaid
pie title "Singapore Market Segments (675,000 routine trainees)"
    "Food Service Workers" : 235000
    "Domestic Helpers" : 295000
    "Healthcare Staff" : 100000
    "Preschool Educators" : 25000
    "National Servicemen" : 20000
```

### Primary Customers
- **Singapore Red Cross Academy**
- **Singapore First Aid Training Centre (SFATC)**
- **Corporate training departments**
- **Healthcare institutions**
- **Educational facilities**

### Market Opportunity Analysis

#### 🌏 Market Size

| Market Level | Size | Details |
|--------------|------|---------|
| **TAM (Total Addressable Market)** | $4.5B → $7.5B by 2032 | Global first aid training market |
| **SAM (Serviceable Addressable Market)** | $750,000 | Singapore: 1,500 entities × 5 vests × $100 |
| **SOM (Serviceable Obtainable Market)** | $75,000 | 10% of SAM in Years 1-2 |
| **Singapore Annual Market** | $28 million | ~50,000 annual choke rescue learners |
| **ASEAN Expansion** | 20x opportunity | Regional scaling potential |

### Value Proposition Canvas

```mermaid
graph LR
    subgraph "Customer Pain Points"
        A[Can't assess pressure accurately]
        B[High teacher-student ratios]
        C[Improper technique feedback]
        D[Low trainee confidence]
    end
    
    subgraph "RescueRight Solutions"
        E[Real-time sensor feedback]
        F[AI individual coaching]
        G[Precise analytics]
        H[Verified certification]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    
    style E fill:#9f9,stroke:#333
    style F fill:#9f9,stroke:#333
    style G fill:#9f9,stroke:#333
    style H fill:#9f9,stroke:#333
```

---

## 🏗️ Development Roadmap

### Current Phase: MVP Development Sprint
**September 24 - October 7, 2025**

```mermaid
gantt
    title MVP Development Timeline
    dateFormat  YYYY-MM-DD
    section Procurement
    Component sourcing       :2025-09-24, 3d
    Budget approval         :2025-09-25, 2d
    section Development
    Sensor integration      :2025-09-27, 4d
    App development        :2025-09-28, 5d
    AI algorithm coding    :2025-09-29, 4d
    section Testing
    Integration testing    :2025-10-03, 2d
    User testing          :2025-10-05, 1d
    section Preparation
    Poster design         :2025-10-04, 3d
    Final adjustments     :2025-10-06, 1d
```

### Semifinals Judging Criteria Alignment

| Criteria | RescueRight Response | Evidence |
|----------|---------------------|----------|
| **Product Demonstration** | Live vest demo with real-time feedback | Working MVP prototype |
| **Ergonomics & Usability** | Comfortable, adjustable vest design | User testing results |
| **Technical Design & Feasibility** | Medical-grade sensors, proven tech | Technical specifications |
| **Modularity & Scalability** | Modular sensor pods, cloud-ready | Architecture design |
| **Market Fit & Value Proposition** | Clear B2B model, validated need | Market research data |

---

## 🎤 Competition Pitch Strategy

### 4-Minute Pitch Structure

```mermaid
graph LR
    A[Opening Hook<br/>0:00-0:30<br/>Kai Jie] --> B[Problem Deep Dive<br/>0:30-1:25<br/>Team]
    B --> C[Solution Demo<br/>1:25-2:15<br/>Serena]
    C --> D[Market Opportunity<br/>2:15-2:50<br/>Ansh]
    D --> E[Differentiation<br/>2:50-3:25<br/>Zayan]
    E --> F[Impact & CTA<br/>3:25-4:00<br/>Daniel]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#9f9,stroke:#333,stroke-width:2px
```

### Opening Hook (Kai Jie - 30 seconds)
> "Every 3 minutes, someone in the world dies from choking. And when the airway is blocked, you have just 4 minutes before brain damage begins. It's not rare — 1 in 3 people will experience a choking episode in their lifetime. But the way we train today doesn't prepare people to save lives tomorrow. Courses rely on static mannequins to teach, or even worse, simply ask participants to simulate doing the Heimlich maneuver. Assessments are just about going through the motions — there's no way to verify correct technique. Would someone trained in this manner really be confident to perform such maneuvers in the real world?"

### Closing Impact Statement (Daniel - 35 seconds)
> "With RescueRight: People learn the skill accurately with confidence; rescues will be more effective and safer—especially for vulnerable groups like the elderly. Every 3 minutes, someone dies from choking. RescueRight ensures that when someone is choking, rescuers can act confidently and safely. We're not just improving training. We're creating a smarter and safer standard for lifesaving."

---

## 🎯 Competitive Advantages

### Unique Differentiators

```mermaid
graph TD
    subgraph "RescueRight Advantages"
        A[World's First Smart Choking Vest]
        B[AI-Powered Real-time Coaching]
        C[Medical-grade Precision]
        D[Data-verified Certification]
        E[Scalable B2B Model]
    end
    
    subgraph "Impact"
        F[Higher Success Rates]
        G[Reduced Injury Risk]
        H[Confident Responders]
        I[Lives Saved]
    end
    
    A --> F
    B --> G
    C --> H
    D --> I
    E --> I
    
    style A fill:#ffd700,stroke:#333,stroke-width:3px
    style I fill:#90EE90,stroke:#333,stroke-width:3px
```

### Comparison Matrix

| Feature | RescueRight | Act+Fast Vest | CPR Mannequins | Suction Devices |
|---------|-------------|---------------|----------------|-----------------|
| **Force Measurement** | ✅ 0-300N ±2N | ❌ | ❌ | N/A |
| **Position Tracking** | ✅ 1cm precision | ❌ | ❌ | N/A |
| **Real-time Feedback** | ✅ AI-powered | ❌ | Limited | ❌ |
| **Data Analytics** | ✅ Comprehensive | ❌ | Basic | ❌ |
| **Certification** | ✅ Data-verified | ❌ | ❌ | N/A |
| **Scalability** | ✅ Cloud-ready | Limited | Limited | N/A |
| **Training Focus** | ✅ Choking rescue | ✅ | CPR only | Treatment only |

---

## 📈 Business Model

### Revenue Streams

```mermaid
graph LR
    subgraph "Primary Revenue"
        A[Hardware Sales<br/>$100/vest]
        B[Software Licenses<br/>Annual subscription]
        C[Training Packages<br/>Bulk deals]
    end
    
    subgraph "Secondary Revenue"
        D[Certification Services]
        E[Data Analytics]
        F[Custom Training Scenarios]
    end
    
    A --> G[Projected Year 1<br/>$75,000]
    B --> G
    C --> G
    
    style A fill:#9f9,stroke:#333
    style B fill:#99f,stroke:#333
    style C fill:#f99,stroke:#333
```

### Go-to-Market Strategy

1. **Phase 1: Singapore Launch** (Months 1-6)
   - Partner with 3-5 training centers
   - Pilot programs with feedback loops
   - Refine based on user data

2. **Phase 2: Singapore Expansion** (Months 7-12)
   - Scale to 10% of market (150 entities)
   - Establish certification standards
   - Build brand recognition

3. **Phase 3: ASEAN Entry** (Year 2)
   - Regional partnerships
   - Localized content
   - 20x market opportunity

---

## 🌟 Expected Impact

### Quantifiable Outcomes

| Metric | Current State | With RescueRight | Improvement |
|--------|--------------|------------------|-------------|
| **Training Effectiveness** | 47% success rate | 75%+ projected | +60% improvement |
| **Skill Retention** | 3-6 month decline | 9-12 month retention | 2x better retention |
| **Injury Risk** | Unknown/High | Measured & minimized | Quantified safety |
| **Trainee Confidence** | Low | High (data-backed) | Verified competence |
| **Instructor Efficiency** | 1:20 ratio limited | 1:50+ with AI assist | 2.5x productivity |

### Social Impact

```mermaid
graph TD
    A[RescueRight Implementation] --> B[Better Trained Responders]
    B --> C[Faster Response Times]
    B --> D[Correct Technique Application]
    B --> E[Reduced Injury Risk]
    
    C --> F[Lives Saved]
    D --> F
    E --> F
    
    F --> G[Reduced Healthcare Burden]
    F --> H[Family Impact Prevention]
    F --> I[Economic Benefit]
    
    style A fill:#9f9,stroke:#333,stroke-width:2px
    style F fill:#ffd700,stroke:#333,stroke-width:3px
```

---

## 📞 Contact & Resources

### Team Communication
- **Email**: idp.studentsclub.ideate@u.nus.edu
- **Telegram**: https://t.me/ideate2025
- **Website**: www.ideate2025.com

### Key Contacts
- **Equipment & Budget**: Alvin Poh (alvinpoh@nus.edu.sg)
- **Electronics Lab Hours**: Mon-Fri 8:30am-6pm
- **Required Attire**: Covered shoes and long pants for lab access

### Important Documents
- ✅ Safety Declaration Form (Completed)
- ✅ Risk Assessment (Completed)
- ✅ Indemnity Form (Completed)
- ✅ Safety Quiz (Completed)
- 📋 Item Request List (IRL) - For budget approval
- 📋 List of Purchased Items (LPI) - For reimbursement
- 📋 Job Request Form - For 3D printing/laser cutting

---

## 🚀 Next Steps

### Immediate Actions (By October 7, 2025)
1. ✅ Complete sensor integration
2. ✅ Finalize MVP app development
3. ✅ Conduct user testing sessions
4. ✅ Design and submit A1 poster (18:00 deadline)
5. ✅ Prepare prototype demonstration

### Semifinals Preparation (October 7-15, 2025)
1. 📋 Refine pitch based on mentor feedback
2. 📋 Practice poster presentation
3. 📋 Prepare prototype demonstration
4. 📋 Anticipate judges' questions
5. 📋 Submit finals slides if advancing (Oct 14, 18:00)

### Success Metrics for Semifinals
- **Clear problem articulation** with compelling statistics
- **Live demonstration** of working prototype
- **Strong market validation** with local context
- **Differentiation clarity** vs existing solutions
- **Scalability vision** for ASEAN expansion

---

## 💭 Final Thoughts

RescueRight represents more than just a training tool—it's a paradigm shift in how we prepare people to save lives. By transforming "invisible" forces into measurable, teachable moments, we're not just improving training; we're setting a new standard for emergency response preparation.

Our journey from idea to prototype demonstrates the power of innovation when applied to critical human needs. With every sensor calibrated and every line of code written, we move closer to a world where no one dies from choking due to inadequate rescue attempts.

**Together, we're making every rescue right.**

---

*Document Version: 1.0 | Last Updated: September 28, 2025 | IDEATE 2025 Team 8*