import { ethers } from 'ethers';

// تعریف اینترفیس برای Uniswap V2 Router

interface UniswapV2Router extends ethers.Contract {

    swapExactETHForTokens(

        amountOutMin: ethers.BigNumberish,

        path: string[],

        to: string,

        deadline: ethers.BigNumberish,

        overrides?: ethers.Overrides

    ): Promise<ethers.ContractTransaction>;

    callStatic: {

        swapExactETHForTokens(

            amountOutMin: ethers.BigNumberish,

            path: string[],

            to: string,

            deadline: ethers.BigNumberish,

            overrides?: ethers.Overrides

        ): Promise<ethers.BigNumber[]>;

    };

    getAmountsOut(amountIn: ethers.BigNumberish, path: string[]): Promise<ethers.BigNumber[]>;

}