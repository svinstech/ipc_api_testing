

/*
    This is meant to receive an array that contains the difference between 2 arrays.
    It logs that array after explaining the problem that it represents.
*/
export function LogArrayDifference(_differenceArray:string[]) :void {
    if (_differenceArray.length > 0) {
        const theseOrThis = (_differenceArray.length > 1) ? "These are" : "This is"
        console.log(`DISCREPANCY: ${theseOrThis} not shared between pa_shim & IPC: `)
        console.log(_differenceArray)
    }
}

