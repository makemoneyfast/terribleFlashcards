import * as _ from "Lodash";

interface Attribute {
    typeFingerprint: string;
    mask1: number;
    mask2: number;
    server: string;
    id: string;
}

interface Report {
    identifier: string;
    percentage: number;
    count: number;
}

interface FlagSet {
    mask1: { [flagName: string]: number };
    mask2: { [flagName: string]: number };
}

function makeFingerprint(flagSets: FlagSet[], mask1: number, mask2: number) {
    const flagNames: string[] = [];

    for (const flagSet of flagSets) {
        for (let flagName in flagSet.mask1) {
            if (flagSet.mask1.hasOwnProperty(flagName)) {
                if (
                    (mask1 & flagSet.mask1[flagName]) ===
                    flagSet.mask1[flagName]
                ) {
                    flagNames.push(flagName);
                }
            }
        }

        for (let flagName in flagSet.mask2) {
            if (flagSet.mask2.hasOwnProperty(flagName)) {
                if (
                    (mask2 & flagSet.mask2[flagName]) ===
                    flagSet.mask2[flagName]
                ) {
                    flagNames.push(flagName);
                }
            }
        }
    }

    return flagNames.sort().join(", ");
}

const TypeFlagSet: FlagSet = {
    mask1: {
        float: 1,
        dateTime: 2,
        string: 4,
        number: 8,
        dropDown: 32,
        editDropDown: 64,
        numberDropDown: 32768,
        checkBox: 65536,
        account: 131072,
        integer: 262144,
        volume: 524288,
        list: 2097152,
        mandatory: 8388608,
        security: 16777216,
        organisationList: 67108864,
        organisationGroupList: 134217728
    },
    mask2: {
        stringDropDown: 2,
        stringDropDownMulti: 4194304
    }
};

const DateModifierFlagSet: FlagSet = {
    mask1: {
        localDate: 16,
        dayOnly: 128,
        gmtDate: 2048,
        time: 4096,
        displayTime: 8192,
        displayDate: 16384
    },
    mask2: {
        sendTime: 4,
        sendDate: 8,
        dateTimeInFix: 16
    }
};

const ConstraintFlagSet: FlagSet = {
    mask1: {},
    mask2: {
        valueMustBeProvided: 128,
        triggerPriceReq: 2048,
        volumeReq: 4096,
        percentageReq: 8192,
        tradePriceReq: 32768,
        tradeVolumeReq: 65536,
        tradeValueReq: 131072,
        tradePercentageReq: 262144
    }
};

const ReallyRelevantModifierFlagSet: FlagSet = {
    mask1: {
        sellSideOnly: 1048576
    },
    mask2: {
        copyToTrades: 1,
        legSpecific: 32,
        useSecurityMarketDecimalPlace: 2097152
    }
};

const RelevantModifierFlagSet: FlagSet = {
    mask1: {
        sellSideOnly: 1048576,
        nonMaterial: 268435456,
        vmbMatchPrice: 1073741824
    },
    mask2: {
        copyToTrades: 1,
        dateTimeInFix: 16,
        legSpecific: 32,
        sameSide: 256,
        oppositeSide: 512,
        volumeDecimalPlaceSupported: 16384,
        useLastPriceAsOrderPrice: 1048576,
        useSecurityMarketDecimalPlace: 2097152
    }
};

const AllModifersFlagSet: FlagSet = {
    mask1: {
        systemSet: 512,
        strategyOptinal: 1024,
        sellSideOnly: 1048576,
        impliesAttribute: 4194304,
        transient: 33554432,
        nonMaterial: 268435456,
        existenceCheckbox: 536870912,
        vmbMatchPrice: 1073741824
    },
    mask2: {
        copyToTrades: 1,
        legSpecific: 32,
        updateByReplication: 64,
        sameSide: 256,
        oppositeSide: 512,
        canDefaultFromAncestor: 1024,
        volumeDecimalPlaceSupported: 16384,
        estimatePrice: 524288,
        useLastPriceAsOrderPrice: 1048576,
        useSecurityMarketDecimalPlace: 2097152
    }
};

const UndocumentedFlagSet: FlagSet = {
    mask1: {
        m1a: 2147483648,
        m1b: 4294967296,
        m1c: 8589934592
    },
    mask2: {
        m2a: 8388608,
        m2b: 33554432,
        m2c: 268435456,
        m2d: 536870912,
        m2e: 1073741824,
        m2f: 2147483648,
        m2g: 4294967296,
        m2h: 8589934592
    }
};

function makeTypeFingerprint(mask1: number, mask2: number) {
    return makeFingerprint([TypeFlagSet], mask1, mask2);
}

function makeDateModifierFingerprint(mask1: number, mask2: number) {
    return makeFingerprint([DateModifierFlagSet], mask1, mask2);
}

function makeFlagFingerprint(mask1: number, mask2: number) {
    return makeFingerprint([ReallyRelevantModifierFlagSet], mask1, mask2);
}

function auditFingerprints(
    population: Attribute[],
    makeFingerprint: (mask1: number, mask2: number) => string
) {
    const makeReport = (fingerprint: string, count: number, total: number) => {
        const returnValue: Report = {
            identifier: fingerprint,
            percentage: Math.floor(count / total * 1000) / 10,
            count: count
        };
        return returnValue;
    };

    return _(population)
        .countBy(item => makeFingerprint(item.mask1, item.mask2))
        .map((value, key) => makeReport(key, value, population.length))
        .value()
        .sort(sortByPercentage);
}

function auditIndividualFlags(population: Attribute[], flags: FlagSet) {
    // Flag set 1
    const firstFieldReports = _(flags.mask1)
        .map((bitMask, flagName) => {
            // so I have a particular mask that I want to check against all the attributes
            const attributesWithFlagSet = _(population)
                .filter(attribute => (attribute.mask1 & bitMask) === bitMask)
                .value();

            if (attributesWithFlagSet.length > 0) {
                return {
                    identifier: flagName,
                    percentage:
                        Math.floor(
                            attributesWithFlagSet.length /
                                population.length *
                                1000
                        ) / 10,
                    count: attributesWithFlagSet.length,
                    attributes: attributesWithFlagSet
                };
            } else {
                return undefined;
            }
        })
        .filter(report => report)
        .value();

    const secondFieldReports = _(flags.mask2)
        .map((bitMask, flagName) => {
            // so I have a particular mask that I want to check against all the attributes
            const attributesWithFlagSet = _(population)
                .filter(attribute => (attribute.mask2 & bitMask) === bitMask)
                .value();

            if (attributesWithFlagSet.length > 0) {
                return {
                    identifier: flagName,
                    percentage:
                        Math.floor(
                            attributesWithFlagSet.length /
                                population.length *
                                1000
                        ) / 10,
                    count: attributesWithFlagSet.length,
                    attributes: attributesWithFlagSet
                };
            } else {
                return undefined;
            }
        })
        .filter(report => report)
        .value();

    return firstFieldReports.concat(secondFieldReports).sort(sortByPercentage);
}

function makeSummary(key: string, items: Attribute[], total: number) {
    const flagFingerprintReports = auditFingerprints(
        items,
        makeFlagFingerprint
    );
    const dateModifierReports = auditFingerprints(
        items,
        makeDateModifierFingerprint
    );

    return items.length > 0
        ? {
              percentage: Math.floor(items.length / total * 1000) / 10,
              key,
              flagFingerprints: flagFingerprintReports,
              dateModifierFingerprints: dateModifierReports,
              items
          }
        : undefined;
}

function sortByPercentage(a, b) {
    if (a.percentage > b.percentage) {
        return -1;
    } else if (a.percentage < b.percentage) {
        return 1;
    } else {
        return 0;
    }
}

export function analyseAttributes(rawData: string) {
    const serialisedAttributes = JSON.parse(rawData);

    const makeAttribute = (serialised: string) => {
        const tokens = serialised.split(",");
        const typeMask1 = parseInt(tokens[2]);
        const typeMask2 = parseInt(tokens[3]);

        const newAttribute = {
            server: tokens[0],
            id: tokens[1],

            mask1: typeMask1,
            mask2: typeMask2,
            destination: tokens[4],
            categoryNumber: tokens[5],
            description: tokens[6],
            defaultValue: tokens[7] === "NULL" ? null : tokens[7],
            hidden: tokens[tokens.length - 2] === "True",
            readOnly: tokens[tokens.length - 1] === "True",
            typeFingerprint: "",
            flagFingerprint: ""
        };

        let typeFingerprint = makeTypeFingerprint(typeMask1, typeMask2);
        // augment type fingerprint.
        if (newAttribute.hidden) {
            typeFingerprint = "hidden";
        }
        if (newAttribute.readOnly) {
            typeFingerprint = "readOnly";
        }

        let flagFingerprint = makeFlagFingerprint(typeMask1, typeMask2);

        newAttribute.typeFingerprint = typeFingerprint;
        newAttribute.flagFingerprint = flagFingerprint;

        return newAttribute;
    };

    const allAttributes = _(serialisedAttributes as string[])
        .map(serialisedAttribute => makeAttribute(serialisedAttribute))
        .value();

    // OK, let's analyse by destination
    const byDestination = _(allAttributes)
        .filter(
            attribute =>
                attribute.categoryNumber == "2" ||
                attribute.categoryNumber == "5"
        )
        .filter(attribute => !attribute.hidden)
        .filter(attribute => attribute.destination !== "")
        .groupBy(attribute => attribute.destination)
        .tap(lala => console.log(">>", lala))
        .map(attributes => {
            const uniqueFingerprints = _(attributes)
                .map(attribute => attribute.typeFingerprint)
                .uniq()
                .value();

            const supportCost = _(uniqueFingerprints).reduce(
                (result, value, key) => {
                    const costTable = {
                        string: 0,
                        "": 1,
                        dropDown: 10,
                        number: 100,
                        numberDropDown: 1000,
                        editDropDown: 10000,
                        float: 100000,
                        readOnly: 100000,
                        stringDropDown: 10000000,
                        dateTime: 100000000,
                        integer: 1000000000,
                        checkBox: 10000000000,
                        stringDropDownMulti: 100000000000,
                        volume: 1000000000000,
                        security: 10000000000000,
                        account: 100000000000000
                    };

                    if (typeof result === "string") {
                        result = costTable[result];
                    }
                    return result + costTable[value];
                }
            );
            return {
                uniqueFingerprints,
                destination: attributes[0].destination,
                supportCost,
                attributes
            };
        })
        .value()
        .sort((entryA, entryB) => {
            if (entryB.supportCost > entryA.supportCost) {
                return -1;
            } else if (entryB.supportCost < entryA.supportCost) {
                return 1;
            } else {
                return 0;
            }
        });

    console.log("BY DESTINATION", byDestination);

    const hoho = _(byDestination)
        .groupBy(destination => destination.supportCost)
        .map((arrayOfDestinations, key) => {
            return {
                cost: key
            };
        })
        .value();
    console.log("Ho Ho!", hoho);

    const filteredAttributes = _(allAttributes)
        .filter(
            attribute =>
                attribute.categoryNumber == "2" ||
                attribute.categoryNumber == "5"
        )
        .filter(attribute => !attribute.hidden)
        .filter(attribute => attribute.destination !== "")
        .value();

    return {
        modifiers: auditIndividualFlags(
            filteredAttributes,
            ReallyRelevantModifierFlagSet
        ),
        constraints: auditIndividualFlags(
            filteredAttributes,
            ConstraintFlagSet
        ),
        controls: _(filteredAttributes)
            .groupBy(attribute => attribute.typeFingerprint)
            .map((
                attributes: Attribute[],
                typeFingerprint: string // convert to Summary
            ) =>
                makeSummary(
                    typeFingerprint,
                    attributes,
                    filteredAttributes.length
                )
            )
            .value()
            .sort(sortByPercentage)
    };
}

/*



    const validationFlagsMask1 = {
        dayOnly: 128,
        // fixAttribute: 256,
        systemSet: 512,
        strategyOptinal: 1024,
        gmtDate: 2048,
        time: 4096,
        displayTime: 8192,
        displayDate: 16384,
        sellSideOnly: 1048576,
        impliesAttribute: 4194304,
        mandatory: 8388608,
        transient: 33554432,
        nonMaterial: 268435456,
        existenceCheckbox: 536870912,
        vmbMatchPrice: 1073741824
    };

    const validationFlagsMask2 = {
        valueMustBeProvided: 128,
        triggerPriceReq: 2048,
        volumeReq: 4096,
        percentageReq: 8192,
        tradePriceReq: 32768,
        tradeVolumeReq: 65536,
        tradeValueReq: 131072,
        tradePercentageReq: 262144
    };

    const interestingFlagsMask1 = {
        dayOnly: 128,
        // fixAttribute: 256,
        systemSet: 512,
        strategyOptinal: 1024,
        gmtDate: 2048,
        time: 4096,
        displayTime: 8192,
        displayDate: 16384,
        sellSideOnly: 1048576,
        impliesAttribute: 4194304,
        mandatory: 8388608,
        transient: 33554432,
        nonMaterial: 268435456,
        existenceCheckbox: 536870912,
        vmbMatchPrice: 1073741824
    };

    const interestingFlagsMask2 = {
        copyToTrades: 1,
        legSpecific: 32,
        updateByReplication: 64,
        sameSide: 256,
        oppositeSide: 512,
        canDefaultFromAncestor: 1024,
        volumeDecimalPlaceSupported: 16384,
        estimatePrice: 524288,
        useLastPriceAsOrderPrice: 1048576,
        useSecurityMarketDecimalPlace: 2097152
    };
    
*/
