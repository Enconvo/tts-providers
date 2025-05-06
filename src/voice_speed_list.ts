import { DropdownListCache } from "@enconvo/api"

async function fetch_model() {

    // 0.25x - 4x
    let models: any[] = [
        {
            title: "0.25x",
            value: 0.25
        },
        {
            title: "0.3x", 
            value: 0.3
        },
        {
            title: "0.35x",
            value: 0.35
        },
        {
            title: "0.4x",
            value: 0.4
        },
        {
            title: "0.45x",
            value: 0.45
        },
        {
            title: "0.5x",
            value: 0.5
        },
        {
            title: "0.55x",
            value: 0.55
        },
        {
            title: "0.6x",
            value: 0.6
        },
        {
            title: "0.65x",
            value: 0.65
        },
        {
            title: "0.7x",
            value: 0.7
        },
        {
            title: "0.75x",
            value: 0.75
        },
        {
            title: "0.8x",
            value: 0.8
        },
        {
            title: "0.85x",
            value: 0.85
        },
        {
            title: "0.9x",
            value: 0.9
        },
        {
            title: "0.95x",
            value: 0.95
        },
        {
            title: "1x",
            value: 1
        },
        {
            title: "1.05x",
            value: 1.05
        },
        {
            title: "1.1x",
            value: 1.1
        },
        {
            title: "1.15x",
            value: 1.15
        },
        {
            title: "1.2x",
            value: 1.2
        },
        {
            title: "1.25x",
            value: 1.25
        },
        {
            title: "1.3x",
            value: 1.3
        },
        {
            title: "1.35x",
            value: 1.35
        },
        {
            title: "1.4x",
            value: 1.4
        },
        {
            title: "1.45x",
            value: 1.45
        },
        {
            title: "1.5x",
            value: 1.5
        },
        {
            title: "1.55x",
            value: 1.55
        },
        {
            title: "1.6x",
            value: 1.6
        },
        {
            title: "1.65x",
            value: 1.65
        },
        {
            title: "1.7x",
            value: 1.7
        },
        {
            title: "1.75x",
            value: 1.75
        },
        {
            title: "1.8x",
            value: 1.8
        },
        {
            title: "1.85x",
            value: 1.85
        },
        {
            title: "1.9x",
            value: 1.9
        },
        {
            title: "1.95x",
            value: 1.95
        },
        {
            title: "2x",
            value: 2
        },
        {
            title: "2.05x",
            value: 2.05
        },
        {
            title: "2.1x",
            value: 2.1
        },
        {
            title: "2.15x",
            value: 2.15
        },
        {
            title: "2.2x",
            value: 2.2
        },
        {
            title: "2.25x",
            value: 2.25
        },
        {
            title: "2.3x",
            value: 2.3
        },
        {
            title: "2.35x",
            value: 2.35
        },
        {
            title: "2.4x",
            value: 2.4
        },
        {
            title: "2.45x",
            value: 2.45
        },
        {
            title: "2.5x",
            value: 2.5
        },
        {
            title: "2.55x",
            value: 2.55
        },
        {
            title: "2.6x",
            value: 2.6
        },
        {
            title: "2.65x",
            value: 2.65
        },
        {
            title: "2.7x",
            value: 2.7
        },
        {
            title: "2.75x",
            value: 2.75
        },
        {
            title: "2.8x",
            value: 2.8
        },
        {
            title: "2.85x",
            value: 2.85
        },
        {
            title: "2.9x",
            value: 2.9
        },
        {
            title: "2.95x",
            value: 2.95
        },
        {
            title: "3x",
            value: 3
        },
        {
            title: "3.05x",
            value: 3.05
        },
        {
            title: "3.1x",
            value: 3.1
        },
        {
            title: "3.15x",
            value: 3.15
        },
        {
            title: "3.2x",
            value: 3.2
        },
        {
            title: "3.25x",
            value: 3.25
        },
        {
            title: "3.3x",
            value: 3.3
        },
        {
            title: "3.35x",
            value: 3.35
        },
        {
            title: "3.4x",
            value: 3.4
        },
        {
            title: "3.45x",
            value: 3.45
        },
        {
            title: "3.5x",
            value: 3.5
        },
        {
            title: "3.55x",
            value: 3.55
        },
        {
            title: "3.6x",
            value: 3.6
        },
        {
            title: "3.65x",
            value: 3.65
        },
        {
            title: "3.7x",
            value: 3.7
        },
        {
            title: "3.75x",
            value: 3.75
        },
        {
            title: "3.8x",
            value: 3.8
        },
        {
            title: "3.85x",
            value: 3.85
        },
        {
            title: "3.9x",
            value: 3.9
        },
        {
            title: "3.95x",
            value: 3.95
        },
        {
            title: "4x",
            value: 4
        }
    ]

    return models
}


export default async function main(req: Request) {

    const modelCache = new DropdownListCache(fetch_model)

    const models = await modelCache.getModelsCache({})

    return Response.json(models)
}



