"""Network+ concepts taken out of the question bank, with the reason for each (checked 2026-11-03).

build_track.py drops these ids after it has built the track. Generated concepts stay in their netplus_nd*.py module so
the numbers of the concepts after them do not move (a saved flashcard or flag keeps pointing at the same concept);
hand-written ones are removed from data/networkplus.js. Nothing here deletes a user's saved progress.

The reasons come from comparing the bank with CompTIA's N10-009 exam objectives, version 4.0:
  OFF-OBJECTIVE  the topic is in no objective bullet and not in the acronym list (mostly N10-008 leftovers)
  DUPLICATE      another concept already tests the same fact with the same symptom or scenario
"""

RETIRED = {
    # 1.4: the N10-009 port table has no POP3 or IMAP
    'nd1-14-13': 'OFF-OBJECTIVE: Port 110 (POP3) is not in the N10-009 port table',
    'nd1-14-14': 'OFF-OBJECTIVE: Port 143 (IMAP) is not in the N10-009 port table',
    # 1.5: wavelength multiplexing, BiDi, and termination blocks were dropped from the N10-009 media objective
    'nd1-15-18': 'OFF-OBJECTIVE: bidirectional transceivers are not in objective 1.5',
    'nd1-15-19': 'OFF-OBJECTIVE: CWDM is not in objective 1.5',
    'nd1-15-20': 'OFF-OBJECTIVE: DWDM is not in objective 1.5',
    'nd1-15-27': 'OFF-OBJECTIVE: the 110 punchdown block is not in objective 1.5',
    'nd1-15-28': 'OFF-OBJECTIVE: the 66 punchdown block is not in objective 1.5',
    # 1.10: network-size names and provider links were dropped from N10-009 (satellite and cellular stay in 1.5)
    'nd1-110-2': 'OFF-OBJECTIVE: MAN is not in any N10-009 bullet or the acronym list',
    'nd1-110-3': 'OFF-OBJECTIVE: PAN is not in any N10-009 bullet or the acronym list',
    'nd1-110-4': 'OFF-OBJECTIVE: CAN is not in any N10-009 bullet or the acronym list',
    'nd1-110-7': 'OFF-OBJECTIVE: DSL provider links are not in N10-009',
    'nd1-110-8': 'OFF-OBJECTIVE: cable broadband provider links are not in N10-009',
    'nd1-110-9': 'OFF-OBJECTIVE: leased lines are not in N10-009',
    'nd1-110-11': 'OFF-OBJECTIVE: metro-optical service is not in N10-009',
    'nd1-110-13': 'OFF-OBJECTIVE: colocation facilities are not in N10-009',
    # 2.3
    'nd2-23-21': 'OFF-OBJECTIVE: 802.3x flow control is not in objective 2.2 or the acronym list',
    # 3.4: the N10-009 hardware tools are the toner, cable tester, taps, Wi-Fi analyzer, and visual fault locator
    'nd3-34-3': 'OFF-OBJECTIVE: cable certifiers are not in objective 5.5',
    'nd3-34-4': 'OFF-OBJECTIVE: TDRs are not in objective 5.5',
    'nd3-34-7': 'OFF-OBJECTIVE: OTDRs are not in objective 5.5 (the visual fault locator is)',
    # 5.x
    'nd5-51-8': 'DUPLICATE: the same scenario as nd5-51-1, Identify the problem (gather information, question users)',
    'nd5-52-9': 'DUPLICATE: the same fault as nd5-52-6, a dirty or damaged fiber connector',
    'nd5-53-13': 'DUPLICATE: the same symptom as nd5-53-3, DNS resolution failure (works by IP, not by name)',
    'nd5-53-9': 'DUPLICATE: the same fault as nd5-55-1, VLAN mismatch (a port in the wrong VLAN)',
}
