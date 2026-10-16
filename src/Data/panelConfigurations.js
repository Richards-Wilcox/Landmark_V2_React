//This file contains data and rules about the configuration of panels within sections of garage doors for Richard Wilcox.
//The data in this file came from a document supplied by Richards-Wilcox called "P-2222-K - Panel configurations.pdf".

const panelConfigurations = {
    colonial: {
        panelWidth: 19.9375,
        panelHeight: 14.750,
        sectionRules: [{
            sectionType: "COLONIAL",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 48.000,
                max: 71.00
            },
            endStileWidth: {
                min: 2.750,
                max: 16.062
            },
            muttSpacing: 3.0,
            dimensionA: 42.875,
            notes: ["K2"]
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 72.000,
                max: 75.000
            },
            endStileWidth: {
                min: 4.656,
                max: 14.531
            },
            muttSpacing: 3.0,
            dimensionA: 65.813,
            notes: [],
            special: {
                qtyOfPanels: 2,
                muttSpacing: 3.0,
            },
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 75.125,
                max: 94.875
            },
            endStileWidth: {
                min: 4.656,
                max: 14.531
            },
            muttSpacing: 3.0,
            dimensionA: 65.813,
            notes: []
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 95.0,
                max: 103.125
            },
            endStileWidth: {
                min: 3.125,
                max: 7.188
            },
            muttSpacing: 3.0,
            dimensionA: 88.750,
            notes: []
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 103.250,
                max: 118.875
            },
            endStileWidth: {
                min: 5.750,
                max: 13.563
            },
            muttSpacing: 4.0,
            dimensionA: 91.750,
            notes: []
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 5,
            sectionWidth: {
                min: 119.0,
                max: 142.875
            },
            endStileWidth: {
                min: 3.156,
                max: 15.094
            },
            muttSpacing: 3.250,
            dimensionA: 112.688,
            notes: [],
            special: {
                qtyOfPanels: 4,
                muttSpacing: 6,
            },
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 6,
            sectionWidth: {
                min: 143.0,
                max: 165.875
            },
            endStileWidth: {
                min: 4.188,
                max: 15.625
            },
            muttSpacing: 3.0,
            dimensionA: 134.625,
            notes: []
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 7,
            sectionWidth: {
                min: 166.0,
                max: 177.875
            },
            endStileWidth: {
                min: 4.219,
                max: 10.156
            },
            muttSpacing: 3.0,
            dimensionA: 157.563,
            notes: [],
            special: {
                qtyOfPanels: 6,
                muttSpacing: 5.0,
            },
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 7,
            sectionWidth: {
                min: 178.0,
                max: 189.875
            },
            endStileWidth: {
                min: 4.969,
                max: 10.906
            },
            muttSpacing: 4.750,
            dimensionA: 168.063,
            notes: ["K1"],
            special: {
                qtyOfPanels: 6,
                muttSpacing: 6.0,
            },
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 8,
            sectionWidth: {
                min: 190.0,
                max: 201.625
            },
            endStileWidth: {
                min: 4.750,
                max: 10.563
            },
            muttSpacing: 3.0,
            dimensionA: 180.50,
            notes: []
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 8,
            sectionWidth: {
                min: 201.750,
                max: 227.875
            },
            endStileWidth: {
                min: 2.750,
                max: 15.813
            },
            muttSpacing: 5.250,
            dimensionA: 196.250,
            notes: []
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 9,
            sectionWidth: {
                min: 228.0,
                max: 235.750
            },
            endStileWidth: {
                min: 6.313,
                max: 10.156
            },
            muttSpacing: 4.50,
            dimensionA: 215.438,
            notes: [],
            special: {
                qtyOfPanels: 8,
                muttSpacing: 6.9,
            },
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 10,
            sectionWidth: {
                min: 235.875,
                max: 258.750
            },
            endStileWidth: {
                min: 4.750,
                max: 16.188
            },
            muttSpacing: 3.0,
            dimensionA: 226.375,
            notes: [],
            special: {
                qtyOfPanels: 10,
                muttSpacing: 3.0,
            }
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 11,
            sectionWidth: {
                min: 258.875,
                max: 281.625
            },
            endStileWidth: {
                min: 4.781,
                max: 16.156
            },
            muttSpacing: 3.0,
            dimensionA: 249.313,
            notes: [],
            special: {
                qtyOfPanels: 10,
                muttSpacing: 5.400,
            },
        }, {
            sectionType: "COLONIAL",
            qtyOfPanels: 12,
            sectionWidth: {
                min: 281.750,
                max: 290.0
            },
            endStileWidth: {
                min: 4.750,
                max: 8.875
            },
            muttSpacing: 3.0,
            dimensionA: 272.250,
            notes: []
        }]
    },
    ranch: {
        panelWidth: 42.875,
        panelHeight: 14.750,
        sectionRules: [{
            sectionType: "RANCH",
            qtyOfPanels: 1,
            sectionWidth: {
                min: 48.000,
                max: 75.00
            },
            endStileWidth: {
                min: 2.750,
                max: 16.063
            },
            muttSpacing: 0,
            dimensionA: 42.875,
            notes: ["K2"]
        }, {
            sectionType: "RANCH",
            qtyOfPanels: 1,
            sectionWidth: {
                min: 75.125,
                max: 94.875
            },
            endStileWidth: {
                min: 16.125,
                max: 26.00
            },
            muttSpacing: 0,
            dimensionA: 42.875,
            notes: ["K3"]
        }, {
            sectionType: "RANCH",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 95.00,
                max: 103.125
            },
            endStileWidth: {
                min: 3.125,
                max: 7.188
            },
            muttSpacing: 3.00,
            dimensionA: 88.750,
            notes: []
        }, {
            sectionType: "RANCH",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 103.250,
                max: 118.875
            },
            endStileWidth: {
                min: 6.250,
                max: 14.063
            },
            muttSpacing: 5.0,
            dimensionA: 90.750,
            notes: []
        }, {
            sectionType: "RANCH",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 119.0,
                max: 142.875
            },
            endStileWidth: {
                min: 12.125,
                max: 24.063
            },
            muttSpacing: 9.0,
            dimensionA: 94.750,
            notes: []
        }, {
            sectionType: "RANCH",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 143.0,
                max: 165.875
            },
            endStileWidth: {
                min: 4.188,
                max: 15.625
            },
            muttSpacing: 3.0,
            dimensionA: 134.625,
            notes: []
        }, {
            sectionType: "RANCH",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 166.0,
                max: 177.875
            },
            endStileWidth: {
                min: 10.688,
                max: 16.625
            },
            muttSpacing: 8.0,
            dimensionA: 144.625,
            notes: [],
            special: {
                qtyOfPanels: 3,
                muttSpacing: 7.0,
            },
        }, {
            sectionType: "RANCH",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 178.0,
                max: 189.875
            },
            endStileWidth: {
                min: 14.188,
                max: 20.125
            },
            muttSpacing: 10.5,
            dimensionA: 149.625,
            notes: [],
            special: {
                qtyOfPanels: 3,
                muttSpacing: 9.0,
            },
        }, {
            sectionType: "RANCH",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 190.0,
                max: 201.625
            },
            endStileWidth: {
                min: 4.750,
                max: 10.563
            },
            muttSpacing: 3,
            dimensionA: 180.50,
            notes: []
        }, {
            sectionType: "RANCH",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 201.750,
                max: 227.938,
            },
            endStileWidth: {
                min: 3.875,
                max: 20.875
            },
            muttSpacing: 7.50,
            dimensionA: 194.00,
            notes: []
        }, {
            sectionType: "RANCH",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 228,
                max: 235.750,
            },
            endStileWidth: {
                min: 3.875,
                max: 20.875
            },
            muttSpacing: 7.50,
            dimensionA: 194.00,
            notes: [],
            special: {
                qtyOfPanels: 4,
                muttSpacing: 10.800,
            },
        }, {
            sectionType: "RANCH",
            qtyOfPanels: 5,
            sectionWidth: {
                min: 235.875,
                max: 258.813
            },
            endStileWidth: {
                min: 4.750,
                max: 27.625
            },
            muttSpacing: 3.0,
            dimensionA: 226.375,
            notes: []
        }, {
            sectionType: "RANCH",
            qtyOfPanels: 5,
            sectionWidth: {
                min: 259,
                max: 281.625
            },
            endStileWidth: {
                min: 4.750,
                max: 27.625
            },
            muttSpacing: 3.0,
            dimensionA: 226.375,
            notes: [],
            special: {
                qtyOfPanels: 5,
                muttSpacing: 7.800,
            }
        }, {
            sectionType: "RANCH",
            qtyOfPanels: 6,
            sectionWidth: {
                min: 281.750,
                max: 290.0
            },
            endStileWidth: {
                min: 4.750,
                max: 8.875
            },
            muttSpacing: 3.0,
            dimensionA: 272.250,
            notes: []
        }]
    },
    windemere: {
        panelWidth: 42.875,
        panelHeight: 14.750,
        sectionRules: [{
            sectionType: "WINDEMERE",
            qtyOfPanels: 1,
            sectionWidth: {
                min: 48.000,
                max: 75.00
            },
            endStileWidth: {
                min: 2.750,
                max: 16.063
            },
            muttSpacing: 3,
            dimensionA: 42.875,
            notes: ["K2"]
        }, {
            sectionType: "WINDEMERE",
            qtyOfPanels: 1,
            sectionWidth: {
                min: 75.125,
                max: 95.875
            },
            endStileWidth: {
                min: 16.125,
                max: 26.50
            },
            muttSpacing: 3,
            dimensionA: 42.875,
            notes: ["K3"]
        }, {
            sectionType: "WINDEMERE",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 96.00,
                max: 97.875
            },
            endStileWidth: {
                min: 2.750,
                max: 3.688
            },
            muttSpacing: 4.750,
            dimensionA: 90.500,
            notes: []
        }, {
            sectionType: "WINDEMERE",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 98.000,
                max: 107.875
            },
            endStileWidth: {
                min: 3.250,
                max: 8.188
            },
            muttSpacing: 5.75,
            dimensionA: 91.500,
            notes: []
        }, {
            sectionType: "WINDEMERE",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 108.0,
                max: 143.875
            },
            endStileWidth: {
                min: 5.563,
                max: 23.50
            },
            muttSpacing: 11.125,
            dimensionA: 96.875,
            notes: []
        }, {
            sectionType: "WINDEMERE",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 144.0,
                max: 146.875
            },
            endStileWidth: {
                min: 2.750,
                max: 4.188
            },
            muttSpacing: 4.938,
            dimensionA: 138.50,
            notes: []
        }, {
            sectionType: "WINDEMERE",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 147.0,
                max: 167.875
            },
            endStileWidth: {
                min: 3.25,
                max: 13.688
            },
            muttSpacing: 5.938,
            dimensionA: 140.50,
            notes: []
        }, {
            sectionType: "WINDEMERE",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 168.0,
                max: 179.875
            },
            endStileWidth: {
                min: 10.688,
                max: 16.625
            },
            muttSpacing: 9.0,
            dimensionA: 146.625,
            notes: []
        }, {
            sectionType: "WINDEMERE",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 180.0,
                max: 191.875
            },
            endStileWidth: {
                min: 11.563,
                max: 17.50
            },
            muttSpacing: 14.125,
            dimensionA: 156.875,
            notes: []
        }, {
            sectionType: "WINDEMERE",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 192.00,
                max: 215.875
            },
            endStileWidth: {
                min: 2.750,
                max: 14.688
            },
            muttSpacing: 5.00,
            dimensionA: 186.50,
            notes: []
        }, {
            sectionType: "WINDEMERE",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 216.00,
                max: 231.875
            },
            endStileWidth: {
                min: 8.750,
                max: 16.375
            },
            muttSpacing: 9.0,
            dimensionA: 198.50,
            notes: []
        }, {
            sectionType: "WINDEMERE",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 231.375,
                max: 242.0
            },
            endStileWidth: {
                min: 8.750,
                max: 14.063
            },
            muttSpacing: 14.125,
            dimensionA: 213.875,
            notes: []
        }, {
            sectionType: "WINDEMERE",
            qtyOfPanels: 5,
            sectionWidth: {
                min: 242.125,
                max: 262.50
            },
            endStileWidth: {
                min: 3.875,
                max: 14.063
            },
            muttSpacing: 5.00,
            dimensionA: 234.375,
            notes: []
        }, {
            sectionType: "WINDEMERE",
            qtyOfPanels: 5,
            sectionWidth: {
                min: 262.625,
                max: 290.0
            },
            endStileWidth: {
                min: 6.125,
                max: 19.813
            },
            muttSpacing: 9.000,
            dimensionA: 250.375,
            notes: []
        }]
    },
    mixed: {
        panelWidthRnc: 42.875,
        panelHeightRnc: 14.750,
        panelWidthCol: 19.9375,
        panelHeightCol: 14.750,
        sectionRules: [{
            sectionType: "MIXED",
            qtyOfPanels: 3,
            pattern: ["C", "R", "C"],
            sectionWidth: {
                min: 96.00,
                max: 102.00
            },
            endStileWidth: {
                min: 3.625,
                max: 6.625
            },
            muttSpacing: 3,
            dimensionA: 88.75,
            notes: []
        }, {
            sectionType: "MIXED",
            qtyOfPanels: 3,
            pattern: ["C", "R", "C"],
            sectionWidth: {
                min: 102.125,
                max: 119.875
            },
            endStileWidth: {
                min: 4.938,
                max: 13.813
            },
            muttSpacing: 4.75,
            dimensionA: 92.25,
            notes: []
        }, {
            sectionType: "MIXED",
            qtyOfPanels: 3,
            pattern: ["R", "C", "R"],
            sectionWidth: {
                min: 120.00,
                max: 143.875
            },
            endStileWidth: {
                min: 4.156,
                max: 16.094
            },
            muttSpacing: 3.00,
            dimensionA: 111.688,
            notes: []
        }, {
            sectionType: "MIXED",
            qtyOfPanels: 4,
            pattern: ["C", "R", "R", "C"],
            sectionWidth: {
                min: 144.000,
                max: 167.875
            },
            endStileWidth: {
                min: 4.688,
                max: 16.625
            },
            muttSpacing: 3.00,
            dimensionA: 134.625,
            notes: []
        }, {
            sectionType: "MIXED",
            qtyOfPanels: 5,
            pattern: ["C", "R", "C", "R", "C"],
            sectionWidth: {
                min: 168.0,
                max: 179.875
            },
            endStileWidth: {
                min: 5.219,
                max: 11.156
            },
            muttSpacing: 3.00,
            dimensionA: 157.563,
            notes: []
        }, {
            sectionType: "MIXED",
            qtyOfPanels: 5,
            pattern: ["C", "R", "C", "R", "C"],
            sectionWidth: {
                min: 180.0,
                max: 191.875
            },
            endStileWidth: {
                min: 7.719,
                max: 13.656
            },
            muttSpacing: 4.750,
            dimensionA: 164.563,
            notes: []
        }, {
            sectionType: "MIXED",
            qtyOfPanels: 7,
            pattern: ["C", "C", "C", "R", "C", "C", "C"],
            sectionWidth: {
                min: 192.0,
                max: 211.875
            },
            endStileWidth: {
                min: 5.75,
                max: 15.688
            },
            muttSpacing: 3.00,
            dimensionA: 180.50,
            notes: []
        }, {
            sectionType: "MIXED",
            qtyOfPanels: 7,
            pattern: ["C", "R", "C", "C", "C", "R", "C"],
            sectionWidth: {
                min: 212.00,
                max: 237.875
            },
            endStileWidth: {
                min: 4.281,
                max: 17.219
            },
            muttSpacing: 3.0,
            dimensionA: 203.438,
            notes: []
        }, {
            sectionType: "MIXED",
            qtyOfPanels: 7,
            pattern: ["R", "C", "C", "R", "C", "C", "R"],
            sectionWidth: {
                min: 238.0,
                max: 256.625
            },
            endStileWidth: {
                min: 5.813,
                max: 15.125
            },
            muttSpacing: 3.0,
            dimensionA: 226.375,
            notes: []
        }, {
            sectionType: "MIXED",
            qtyOfPanels: 9,
            pattern: ["C", "C", "C", "R", "C", "R", "C", "C", "C"],
            sectionWidth: {
                min: 256.75,
                max: 279.625
            },
            endStileWidth: {
                min: 3.719,
                max: 15.156
            },
            muttSpacing: 3.00,
            dimensionA: 249.313,
            notes: []
        }, {
            sectionType: "MIXED",
            qtyOfPanels: 10,
            pattern: ["C", "C", "R", "C", "C", "C", "C", "R", "C", "C"],
            sectionWidth: {
                min: 279.75,
                max: 290.00
            },
            endStileWidth: {
                min: 3.750,
                max: 8.875
            },
            muttSpacing: 3.0,
            dimensionA: 272.25,
            notes: []
        }]
    },
    colonial_gv: {
        panelWidth: 19.9375,
        panelHeight: 14.750,
        sectionRules: [{
            sectionType: "COLONIAL_GV",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 50.000,
                max: 94.875
            },
            endStileWidth: {
                min: 3.563,
                max: 26.00
            },
            muttSpacing: 3.0,
            dimensionA: 42.875,
            notes: ["K2"]
        }, {
            sectionType: "COLONIAL_GV",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 95.0,
                max: 103.125
            },
            endStileWidth: {
                min: 3.125,
                max: 7.188
            },
            muttSpacing: 3.0,
            dimensionA: 88.750,
            notes: []
        }, {
            sectionType: "COLONIAL_GV",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 103.250,
                max: 118.875
            },
            endStileWidth: {
                min: 5.750,
                max: 13.563
            },
            muttSpacing: 4.0,
            dimensionA: 91.750,
            notes: []
        }, {
            sectionType: "COLONIAL_GV",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 119.0,
                max: 142.875
            },
            endStileWidth: {
                min: 10.625,
                max: 22.563
            },
            muttSpacing: 6.00,
            dimensionA: 97.750,
            notes: []
        }, {
            sectionType: "COLONIAL_GV",
            qtyOfPanels: 6,
            sectionWidth: {
                min: 143.0,
                max: 189.875
            },
            endStileWidth: {
                min: 4.188,
                max: 27.625
            },
            muttSpacing: 3.0,
            dimensionA: 134.625,
            notes: []
        }, {
            sectionType: "COLONIAL_GV",
            qtyOfPanels: 8,
            sectionWidth: {
                min: 190.0,
                max: 201.625
            },
            endStileWidth: {
                min: 4.750,
                max: 10.563
            },
            muttSpacing: 3.0,
            dimensionA: 180.5,
            notes: []
        }, {
            sectionType: "COLONIAL_GV",
            qtyOfPanels: 8,
            sectionWidth: {
                min: 201.75,
                max: 218.00
            },
            endStileWidth: {
                min: 2.750,
                max: 10.875
            },
            muttSpacing: 5.250,
            dimensionA: 196.250,
            notes: []
        }]
    },
    window_gv: {
        panelWidth: 42.69,
        panelHeight: 17.19,
        sectionRules: [{
            sectionType: "GRANDVIEW",
            qtyOfPanels: 1,
            sectionWidth: {
                min: 50.000,
                max: 94.875
            },
            endStileWidth: {
                min: 3.563,
                max: 26.594
            },
            muttSpacing: 0,
            dimensionA: 41.688,
            notes: []
        }, {
            sectionType: "GRANDVIEW",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 95.00,
                max: 103.125
            },
            endStileWidth: {
                min: 3.719,
                max: 7.781
            },
            muttSpacing: 4.188,
            dimensionA: 87.563,
            notes: []
        }, {
            sectionType: "GRANDVIEW",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 103.250,
                max: 118.875
            },
            endStileWidth: {
                min: 6.844,
                max: 14.656
            },
            muttSpacing: 6.188,
            dimensionA: 89.562,
            notes: []
        }, {
            sectionType: "GRANDVIEW",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 119.0,
                max: 142.875
            },
            endStileWidth: {
                min: 12.719,
                max: 24.656
            },
            muttSpacing: 10.188,
            dimensionA: 93.563,
            notes: []
        }, {
            sectionType: "GRANDVIEW",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 143.0,
                max: 165.875
            },
            endStileWidth: {
                min: 4.781,
                max: 16.219
            },
            muttSpacing: 4.188,
            dimensionA: 133.438,
            notes: []
        }, {
            sectionType: "GRANDVIEW",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 166.0,
                max: 177.875
            },
            endStileWidth: {
                min: 11.281,
                max: 17.219
            },
            muttSpacing: 9.188,
            dimensionA: 143.438,
            notes: []
        }, {
            sectionType: "GRANDVIEW",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 178.0,
                max: 189.875
            },
            endStileWidth: {
                min: 14.781,
                max: 20.719
            },
            muttSpacing: 11.688,
            dimensionA: 148.438,
            notes: []
        }, {
            sectionType: "GRANDVIEW",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 190.0,
                max: 201.625
            },
            endStileWidth: {
                min: 5.344,
                max: 11.156
            },
            muttSpacing: 4.188,
            dimensionA: 179.313,
            notes: []
        }, {
            sectionType: "GRANDVIEW",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 201.750,
                max: 218.000
            },
            endStileWidth: {
                min: 4.469,
                max: 12.594
            },
            muttSpacing: 8.688,
            dimensionA: 192.813,
            notes: []
        }]
    },
    ranch_gv: {
        panelWidth: 42.875,
        panelHeight: 14.750,
        sectionRules: [{
            sectionType: "RANCH_GV",
            qtyOfPanels: 1,
            sectionWidth: {
                min: 50.00,
                max: 94.875
            },
            endStileWidth: {
                min: 3.563,
                max: 26.00
            },
            muttSpacing: 0,
            dimensionA: 42.875,
            notes: []
        }, {
            sectionType: "RANCH_GV",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 95.00,
                max: 103.125
            },
            endStileWidth: {
                min: 3.125,
                max: 7.188
            },
            muttSpacing: 3.00,
            dimensionA: 88.750,
            notes: []
        }, {
            sectionType: "RANCH_GV",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 103.250,
                max: 118.875
            },
            endStileWidth: {
                min: 6.250,
                max: 14.063
            },
            muttSpacing: 5.0,
            dimensionA: 90.750,
            notes: []
        }, {
            sectionType: "RANCH_GV",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 119.0,
                max: 142.875
            },
            endStileWidth: {
                min: 12.125,
                max: 24.063
            },
            muttSpacing: 9.0,
            dimensionA: 94.750,
            notes: []
        }, {
            sectionType: "RANCH_GV",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 143.0,
                max: 165.875
            },
            endStileWidth: {
                min: 4.188,
                max: 15.625
            },
            muttSpacing: 3.0,
            dimensionA: 134.625,
            notes: []
        }, {
            sectionType: "RANCH_GV",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 166.0,
                max: 177.875
            },
            endStileWidth: {
                min: 10.688,
                max: 16.625
            },
            muttSpacing: 8.0,
            dimensionA: 144.625,
            notes: []
        }, {
            sectionType: "RANCH_GV",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 178.0,
                max: 189.875
            },
            endStileWidth: {
                min: 14.188,
                max: 20.125
            },
            muttSpacing: 10.5,
            dimensionA: 149.625,
            notes: []
        }, {
            sectionType: "RANCH_GV",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 190.0,
                max: 201.625
            },
            endStileWidth: {
                min: 4.750,
                max: 10.563
            },
            muttSpacing: 3,
            dimensionA: 180.50,
            notes: []
        }, {
            sectionType: "RANCH_GV",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 201.750,
                max: 218.00
            },
            endStileWidth: {
                min: 3.875,
                max: 12.00
            },
            muttSpacing: 7.50,
            dimensionA: 194.00,
            notes: []
        }]
    },
    windemere_gv: {
        panelWidth: 42.875,
        panelHeight: 14.750,
        sectionRules: [{
            sectionType: "WINDEMERE_GV",
            qtyOfPanels: 1,
            sectionWidth: {
                min: 50.00,
                max: 95.875
            },
            endStileWidth: {
                min: 3.563,
                max: 26.5
            },
            muttSpacing: 0,
            dimensionA: 42.875,
            notes: []
        }, {
            sectionType: "WINDEMERE_GV",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 96.00,
                max: 97.875
            },
            endStileWidth: {
                min: 2.750,
                max: 3.688
            },
            muttSpacing: 4.750,
            dimensionA: 90.50,
            notes: []
        }, {
            sectionType: "WINDEMERE_GV",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 98.00,
                max: 107.875
            },
            endStileWidth: {
                min: 3.250,
                max: 8.188
            },
            muttSpacing: 5.75,
            dimensionA: 91.50,
            notes: []
        }, {
            sectionType: "WINDEMERE_GV",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 108.0,
                max: 143.875
            },
            endStileWidth: {
                min: 5.563,
                max: 23.50
            },
            muttSpacing: 11.125,
            dimensionA: 96.875,
            notes: []
        }, {
            sectionType: "WINDEMERE_GV",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 144.0,
                max: 146.875
            },
            endStileWidth: {
                min: 2.75,
                max: 4.188
            },
            muttSpacing: 4.938,
            dimensionA: 138.5,
            notes: []
        }, {
            sectionType: "WINDEMERE_GV",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 147.0,
                max: 167.875
            },
            endStileWidth: {
                min: 3.25,
                max: 13.688
            },
            muttSpacing: 5.938,
            dimensionA: 140.5,
            notes: []
        }, {
            sectionType: "WINDEMERE_GV",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 168.0,
                max: 179.875
            },
            endStileWidth: {
                min: 10.688,
                max: 16.625
            },
            muttSpacing: 9.0,
            dimensionA: 146.625,
            notes: []
        }, {
            sectionType: "WINDEMERE_GV",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 180.0,
                max: 191.875
            },
            endStileWidth: {
                min: 11.592,
                max: 17.5
            },
            muttSpacing: 14.125,
            dimensionA: 156.875,
            notes: []
        }, {
            sectionType: "WINDEMERE_GV",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 192.00,
                max: 215.875
            },
            endStileWidth: {
                min: 2.75,
                max: 14.688
            },
            muttSpacing: 5.00,
            dimensionA: 186.5,
            notes: []
        }, {
            sectionType: "WINDEMERE_GV",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 216.00,
                max: 218.00
            },
            endStileWidth: {
                min: 8.750,
                max: 9.750
            },
            muttSpacing: 9.00,
            dimensionA: 198.5,
            notes: []
        }]
    },
    window_gv_windemere: {
        panelWidth: 41.688,
        panelHeight: 16.188,
        sectionRules: [{
            sectionType: "GRANDVIEW_WINDEMERE",
            qtyOfPanels: 1,
            sectionWidth: {
                min: 50.00,
                max: 95.875
            },
            endStileWidth: {
                min: 3.563,
                max: 27.094
            },
            muttSpacing: 0,
            dimensionA: 41.688,
            notes: []
        }, {
            sectionType: "GRANDVIEW_WINDEMERE",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 96.00,
                max: 97.875
            },
            endStileWidth: {
                min: 3.344,
                max: 4.281
            },
            muttSpacing: 5.938,
            dimensionA: 89.313,
            notes: []
        }, {
            sectionType: "GRANDVIEW_WINDEMERE",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 98.00,
                max: 107.875
            },
            endStileWidth: {
                min: 3.844,
                max: 8.781
            },
            muttSpacing: 6.938,
            dimensionA: 90.313,
            notes: []
        }, {
            sectionType: "GRANDVIEW_WINDEMERE",
            qtyOfPanels: 2,
            sectionWidth: {
                min: 108.0,
                max: 143.875
            },
            endStileWidth: {
                min: 6.156,
                max: 24.094
            },
            muttSpacing: 12.313,
            dimensionA: 95.688,
            notes: []
        }, {
            sectionType: "GRANDVIEW_WINDEMERE",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 144.0,
                max: 146.875
            },
            endStileWidth: {
                min: 3.344,
                max: 4.781
            },
            muttSpacing: 6.125,
            dimensionA: 137.313,
            notes: []
        }, {
            sectionType: "GRANDVIEW_WINDEMERE",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 147.0,
                max: 167.875
            },
            endStileWidth: {
                min: 3.844,
                max: 14.281
            },
            muttSpacing: 7.125,
            dimensionA: 139.313,
            notes: []
        }, {
            sectionType: "GRANDVIEW_WINDEMERE",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 168.0,
                max: 179.875
            },
            endStileWidth: {
                min: 11.281,
                max: 17.219
            },
            muttSpacing: 10.188,
            dimensionA: 146.625,
            notes: []
        }, {
            sectionType: "GRANDVIEW_WINDEMERE",
            qtyOfPanels: 3,
            sectionWidth: {
                min: 180.0,
                max: 191.875
            },
            endStileWidth: {
                min: 12.156,
                max: 18.094
            },
            muttSpacing: 15.313,
            dimensionA: 155.688,
            notes: []
        }, {
            sectionType: "GRANDVIEW_WINDEMERE",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 192.00,
                max: 215.875
            },
            endStileWidth: {
                min: 3.438,
                max: 15.375
            },
            muttSpacing: 6.126,
            dimensionA: 185.125,
            notes: []
        }, {
            sectionType: "GRANDVIEW_WINDEMERE",
            qtyOfPanels: 4,
            sectionWidth: {
                min: 216.00,
                max: 218.00
            },
            endStileWidth: {
                min: 9.344,
                max: 10.344
            },
            muttSpacing: 10.188,
            dimensionA: 197.313,
            notes: []
        }]
    },
    slim_double: {
        panelWidth: 69.285,
        panelHeight: 7.535,
        sectionRules: [{
            sectionType: "SLIM_DBL",
            qtyOfPanels: 1,
            sectionWidth: {
                min: 1.000,
                max: 290.00
            },
            muttSpacing: 0,
            dimensionA: 0,
            notes: []
        }]
    },
    slim_single: {
        panelWidth: 35.285,
        panelHeight: 7.535,
        sectionRules: [{
            sectionType: "SLIM",
            qtyOfPanels: 1,
            sectionWidth: {
                min: 1.000,
                max: 290.00
            },
            muttSpacing: 0,
            dimensionA: 0,
            notes: []
        }]
    }
}


export default panelConfigurations;