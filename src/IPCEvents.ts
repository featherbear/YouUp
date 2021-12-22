enum types {
    seed,
    exit,
    data
}

type IPCTypes = keyof typeof types
export default IPCTypes